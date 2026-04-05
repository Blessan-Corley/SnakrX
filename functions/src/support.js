const { functions, admin, crypto, db } = require('./runtime');
const {
  SUPPORT_COLLECTION,
  SUPPORT_RATE_LIMITS,
  MAX_SUPPORT_SUBMISSIONS_PER_HOUR,
  MAX_SUPPORT_IP_SUBMISSIONS_PER_HOUR,
  SUPPORT_TICKET_STATUSES,
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_CATEGORIES,
  getEmailKey,
  getIpHash,
  getClientIp,
  sanitizeText,
  sanitizeFileName,
  checkRateLimit,
  getTransporter,
  buildSupportEmail,
  buildSupportUpdateEmail,
  assertAdminUser,
  sanitizeSupportAttachments,
  buildStorageDownloadUrl,
} = require('./shared/utils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolveSupportTicketInput = ({
  payload = {},
  userPayload = {},
  authenticatedEmail = '',
  services = {}
}) => {
  const runtimeFunctions = services.functions || functions;
  const sanitize = services.sanitizeText || sanitizeText;
  const sanitizeAttachments = services.sanitizeSupportAttachments || sanitizeSupportAttachments;
  const email = sanitize(payload.email || authenticatedEmail || userPayload.email, 160).toLowerCase();
  const description = sanitize(payload.description, 4000);
  const title = sanitize(payload.title, 140) || 'Support request';
  const category = sanitize(payload.category, 64).toLowerCase() || 'other';
  const supportAttachments = sanitizeAttachments(payload.attachments || []);

  if (!email) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Email is required.');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Please provide a valid email address.');
  }

  if (!description || description.length < 10) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Please include more detail in the description.');
  }

  if (!SUPPORT_TICKET_CATEGORIES.has(category)) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Invalid support ticket category.');
  }

  return {
    category,
    description,
    email,
    supportAttachments,
    title
  };
};

const buildSupportTicketRecord = ({
  ticketId,
  payload = {},
  userPayload = {},
  context = {},
  resolvedInput,
  now,
  timestampFactory,
  storedAttachments = []
}) => ({
  id: ticketId,
  userId: context.auth?.uid || null,
  username: sanitizeText(payload.username || userPayload.username, 64) || null,
  displayName: sanitizeText(payload.name || userPayload.displayName, 120) || null,
  email: resolvedInput.email,
  category: resolvedInput.category,
  title: resolvedInput.title,
  description: resolvedInput.description,
  device: sanitizeText(payload.device, 120) || '',
  attachments: storedAttachments,
  attachmentNames: storedAttachments.map((attachment) => attachment.name),
  status: 'open',
  priority: 'normal',
  adminResponse: '',
  customerUnreadUpdate: false,
  customerUnreadUpdateCount: 0,
  source: sanitizeText(payload.source, 64) || 'support_form',
  clientCreatedAt: now,
  createdAt: timestampFactory.fromMillis(now),
  updatedAt: timestampFactory.fromMillis(now)
});

const buildAdminTicketUpdatePayload = ({
  currentTicket = {},
  status,
  priority,
  adminResponse,
  now,
  adminUserId,
  timestampFactory
}) => ({
  status,
  priority,
  adminResponse,
  customerUnreadUpdate: true,
  customerUnreadUpdateCount: Number(currentTicket.customerUnreadUpdateCount || 0) + 1,
  updatedAt: timestampFactory.fromMillis(now),
  adminUpdatedAt: timestampFactory.fromMillis(now),
  adminUpdatedBy: adminUserId
});

const buildSeenUpdatePayload = ({ ticketData = {}, userId, now }) => {
  if (ticketData.userId !== userId) return null;
  if (!ticketData.customerUnreadUpdate) return null;

  return {
    customerUnreadUpdate: false,
    customerUnreadUpdateCount: 0,
    customerSeenAt: now,
    updatedAt: now
  };
};

const submitSupportTicketHandler = async (data, context, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeCrypto = services.crypto || crypto;
  const runtimeDb = services.db || db;
  const runtimeGetClientIp = services.getClientIp || getClientIp;
  const runtimeGetIpHash = services.getIpHash || getIpHash;
  const runtimeCheckRateLimit = services.checkRateLimit || checkRateLimit;
  const runtimeGetEmailKey = services.getEmailKey || getEmailKey;
  const runtimeSanitizeText = services.sanitizeText || sanitizeText;
  const runtimeSanitizeFileName = services.sanitizeFileName || sanitizeFileName;
  const runtimeGetTransporter = services.getTransporter || getTransporter;
  const runtimeBuildSupportEmail = services.buildSupportEmail || buildSupportEmail;
  const runtimeBuildStorageDownloadUrl = services.buildStorageDownloadUrl || buildStorageDownloadUrl;
  const runtimeLogger = services.logger || runtimeFunctions.logger;
  const runtimeNow = services.now || Date.now;

  const payload = data?.payload || {};
  const userPayload = data?.user || {};
  const authenticatedEmail = runtimeSanitizeText(context.auth?.token?.email || '', 160).toLowerCase();

  const {
    category,
    description,
    email,
    supportAttachments,
    title
  } = resolveSupportTicketInput({ payload, userPayload, authenticatedEmail, services });

  const ip = runtimeGetClientIp(context);
  const ipHash = runtimeGetIpHash(ip);
  if (ipHash) {
    const ipRef = runtimeDb.collection(SUPPORT_RATE_LIMITS).doc(ipHash);
    const ipCheck = await runtimeCheckRateLimit(
      ipRef,
      MAX_SUPPORT_IP_SUBMISSIONS_PER_HOUR,
      60 * 60 * 1000,
      'submit'
    );
    if (!ipCheck.allowed) {
      throw new runtimeFunctions.https.HttpsError(
        'resource-exhausted',
        'Too many support requests. Please try again later.',
        { retryAfterMs: ipCheck.retryAfterMs || 0 }
      );
    }
  }

  const emailKey = runtimeGetEmailKey(email);
  const emailRateRef = runtimeDb.collection(SUPPORT_RATE_LIMITS).doc(`email_${emailKey}`);
  const emailRateCheck = await runtimeCheckRateLimit(
    emailRateRef,
    MAX_SUPPORT_SUBMISSIONS_PER_HOUR,
    60 * 60 * 1000,
    'submit'
  );
  if (!emailRateCheck.allowed) {
    throw new runtimeFunctions.https.HttpsError(
      'resource-exhausted',
      'Too many support requests. Please try again later.',
      { retryAfterMs: emailRateCheck.retryAfterMs || 0 }
    );
  }

  const now = runtimeNow();
  const ticketRef = runtimeDb.collection(SUPPORT_COLLECTION).doc();
  const bucket = runtimeAdmin.storage().bucket();
  const uploadedAttachmentPaths = [];

  try {
    const storedAttachments = [];

    for (let index = 0; index < supportAttachments.length; index += 1) {
      const attachment = supportAttachments[index];
      const attachmentName = runtimeSanitizeText(attachment.name, 120) || `attachment-${index + 1}`;
      const storageFileName = runtimeSanitizeFileName(attachmentName, 120);
      const attachmentPath = `supportAttachments/${ticketRef.id}/${runtimeNow()}_${index}_${storageFileName}`;
      const downloadToken = runtimeCrypto.randomUUID();
      const file = bucket.file(attachmentPath);

      await file.save(attachment.buffer, {
        resumable: false,
        metadata: {
          contentType: attachment.contentType,
          cacheControl: 'private,max-age=0,no-transform',
          contentDisposition: `attachment; filename="${storageFileName}"`,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken
          }
        }
      });

      uploadedAttachmentPaths.push(attachmentPath);
      storedAttachments.push({
        name: attachmentName,
        contentType: attachment.contentType,
        size: attachment.size,
        path: attachmentPath,
        url: runtimeBuildStorageDownloadUrl(bucket.name, attachmentPath, downloadToken)
      });
    }

    const ticket = buildSupportTicketRecord({
      ticketId: ticketRef.id,
      payload,
      userPayload,
      context,
      resolvedInput: {
        category,
        description,
        email,
        title
      },
      now,
      timestampFactory: runtimeAdmin.firestore.Timestamp,
      storedAttachments
    });

    await ticketRef.set(ticket, { merge: true });

    try {
      const transporter = runtimeGetTransporter();
      const template = runtimeBuildSupportEmail(ticket);
      const supportTo = (process.env.SUPPORT_EMAIL_TO || process.env.EMAIL_USER || '').trim();

      if (supportTo) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM ? process.env.EMAIL_FROM : `SnakrX <${process.env.EMAIL_USER}>`,
          to: supportTo,
          replyTo: ticket.email,
          subject: template.subject,
          text: template.text,
          html: template.html
        });
      }
    } catch (error) {
      runtimeLogger.warn('Support email notification failed', {
        ticketId: ticket.id,
        message: error?.message || 'unknown'
      });
    }

    return {
      ticketId: ticket.id,
      attachmentCount: storedAttachments.length
    };
  } catch (error) {
    await Promise.all(uploadedAttachmentPaths.map(async (attachmentPath) => {
      try {
        await bucket.file(attachmentPath).delete({ ignoreNotFound: true });
      } catch (cleanupError) {
        runtimeLogger.warn('Failed to clean up uploaded support attachment', {
          ticketId: ticketRef.id,
          attachmentPath,
          message: cleanupError?.message || 'unknown'
        });
      }
    }));

    try {
      await ticketRef.delete();
    } catch (cleanupError) {
      runtimeLogger.warn('Failed to clean up support ticket after submission error', {
        ticketId: ticketRef.id,
        message: cleanupError?.message || 'unknown'
      });
    }

    if (error instanceof runtimeFunctions.https.HttpsError) {
      throw error;
    }

    runtimeLogger.error('Support ticket submission failed', {
      ticketId: ticketRef.id,
      message: error?.message || 'unknown'
    });
    throw new runtimeFunctions.https.HttpsError(
      'internal',
      'Could not create the support ticket right now. Please try again.'
    );
  }
};

const updateSupportTicketHandler = async (data, context, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeDb = services.db || db;
  const runtimeAssertAdminUser = services.assertAdminUser || assertAdminUser;
  const runtimeSanitizeText = services.sanitizeText || sanitizeText;
  const runtimeGetTransporter = services.getTransporter || getTransporter;
  const runtimeBuildSupportUpdateEmail = services.buildSupportUpdateEmail || buildSupportUpdateEmail;
  const runtimeLogger = services.logger || runtimeFunctions.logger;
  const runtimeNow = services.now || Date.now;

  await runtimeAssertAdminUser(context);

  const ticketId = runtimeSanitizeText(data?.ticketId || '', 128);
  if (!ticketId) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Ticket id is required.');
  }

  const status = runtimeSanitizeText(data?.status || '', 32).toLowerCase();
  if (!SUPPORT_TICKET_STATUSES.has(status)) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Invalid support ticket status.');
  }

  const priority = runtimeSanitizeText(data?.priority || 'normal', 32).toLowerCase() || 'normal';
  if (!SUPPORT_TICKET_PRIORITIES.has(priority)) {
    throw new runtimeFunctions.https.HttpsError('invalid-argument', 'Invalid support ticket priority.');
  }

  const adminResponse = runtimeSanitizeText(data?.adminResponse || '', 2000);
  const ticketRef = runtimeDb.collection(SUPPORT_COLLECTION).doc(ticketId);
  const now = runtimeNow();
  let updatedTicket = null;

  await runtimeDb.runTransaction(async (transaction) => {
    const ticketSnap = await transaction.get(ticketRef);
    if (!ticketSnap.exists) {
      throw new runtimeFunctions.https.HttpsError('not-found', 'Support ticket was not found.');
    }

    const currentTicket = ticketSnap.data() || {};
    const updatePayload = buildAdminTicketUpdatePayload({
      currentTicket,
      status,
      priority,
      adminResponse,
      now,
      adminUserId: context.auth.uid,
      timestampFactory: runtimeAdmin.firestore.Timestamp
    });

    transaction.set(ticketRef, updatePayload, { merge: true });
    updatedTicket = {
      ...currentTicket,
      ...updatePayload,
      id: ticketSnap.id
    };
  });

  try {
    const transporter = runtimeGetTransporter();
    const template = runtimeBuildSupportUpdateEmail(updatedTicket, status, adminResponse);
    if (updatedTicket?.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM ? process.env.EMAIL_FROM : `SnakrX <${process.env.EMAIL_USER}>`,
        to: updatedTicket.email,
        subject: template.subject,
        text: template.text,
        html: template.html
      });
    }
  } catch (error) {
    runtimeLogger.warn('Support update email failed', {
      ticketId,
      message: error?.message || 'unknown'
    });
  }

  return { ticket: updatedTicket };
};

const markSupportTicketUpdatesSeenHandler = async (data, context, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeDb = services.db || db;
  const runtimeSanitizeText = services.sanitizeText || sanitizeText;
  const userId = context.auth?.uid;
  if (!userId) {
    throw new runtimeFunctions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const ticketIds = Array.isArray(data?.ticketIds)
    ? data.ticketIds.map((ticketId) => runtimeSanitizeText(ticketId, 128)).filter(Boolean).slice(0, 50)
    : [];

  if (!ticketIds.length) {
    return { updatedCount: 0 };
  }

  const now = runtimeAdmin.firestore.Timestamp.fromMillis((services.now || Date.now)());
  let updatedCount = 0;

  await runtimeDb.runTransaction(async (transaction) => {
    const refs = ticketIds.map((ticketId) => runtimeDb.collection(SUPPORT_COLLECTION).doc(ticketId));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));

    snapshots.forEach((ticketSnap) => {
      if (!ticketSnap.exists) return;
      const ticketData = ticketSnap.data() || {};
      const updatePayload = buildSeenUpdatePayload({
        ticketData,
        userId,
        now
      });
      if (!updatePayload) return;

      transaction.set(ticketSnap.ref, updatePayload, { merge: true });
      updatedCount += 1;
    });
  });

  return { updatedCount };
};

const submitSupportTicket = functions.https.onCall(async (data, context) => (
  submitSupportTicketHandler(data, context)
));

const updateSupportTicket = functions.https.onCall(async (data, context) => (
  updateSupportTicketHandler(data, context)
));

const markSupportTicketUpdatesSeen = functions.https.onCall(async (data, context) => (
  markSupportTicketUpdatesSeenHandler(data, context)
));

const __private__ = {
  resolveSupportTicketInput,
  buildSupportTicketRecord,
  buildAdminTicketUpdatePayload,
  buildSeenUpdatePayload,
  sanitizeSupportAttachments,
  submitSupportTicketHandler,
  updateSupportTicketHandler,
  markSupportTicketUpdatesSeenHandler
};

module.exports = {
  submitSupportTicket,
  updateSupportTicket,
  markSupportTicketUpdatesSeen,
  __private__
};




