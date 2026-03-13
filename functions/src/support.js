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

const resolveSupportTicketInput = ({ payload = {}, userPayload = {}, authenticatedEmail = '' }) => {
  const email = sanitizeText(payload.email || authenticatedEmail || userPayload.email, 160).toLowerCase();
  const description = sanitizeText(payload.description, 4000);
  const title = sanitizeText(payload.title, 140) || 'Support request';
  const category = sanitizeText(payload.category, 64) || 'general';
  const supportAttachments = sanitizeSupportAttachments(payload.attachments || []);

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required.');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide a valid email address.');
  }

  if (!description || description.length < 10) {
    throw new functions.https.HttpsError('invalid-argument', 'Please include more detail in the description.');
  }

  if (!SUPPORT_TICKET_CATEGORIES.has(category)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid support ticket category.');
  }

  return {
    category,
    description,
    email,
    supportAttachments,
    title
  };
};

const submitSupportTicket = functions.https.onCall(async (data, context) => {
  const payload = data?.payload || {};
  const userPayload = data?.user || {};
  const authenticatedEmail = sanitizeText(context.auth?.token?.email || '', 160).toLowerCase();

  const {
    category,
    description,
    email,
    supportAttachments,
    title
  } = resolveSupportTicketInput({ payload, userPayload, authenticatedEmail });

  const ip = getClientIp(context);
  const ipHash = getIpHash(ip);
  if (ipHash) {
    const ipRef = db.collection(SUPPORT_RATE_LIMITS).doc(ipHash);
    const ipCheck = await checkRateLimit(
      ipRef,
      MAX_SUPPORT_IP_SUBMISSIONS_PER_HOUR,
      60 * 60 * 1000,
      'submit'
    );
    if (!ipCheck.allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many support requests. Please try again later.',
        { retryAfterMs: ipCheck.retryAfterMs || 0 }
      );
    }
  }

  const emailKey = getEmailKey(email);
  const emailRateRef = db.collection(SUPPORT_RATE_LIMITS).doc(`email_${emailKey}`);
  const emailRateCheck = await checkRateLimit(
    emailRateRef,
    MAX_SUPPORT_SUBMISSIONS_PER_HOUR,
    60 * 60 * 1000,
    'submit'
  );
  if (!emailRateCheck.allowed) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many support requests. Please try again later.',
      { retryAfterMs: emailRateCheck.retryAfterMs || 0 }
    );
  }

  const now = Date.now();
  const ticketRef = db.collection(SUPPORT_COLLECTION).doc();
  const bucket = admin.storage().bucket();
  const uploadedAttachmentPaths = [];

  try {
    const storedAttachments = [];

    for (let index = 0; index < supportAttachments.length; index += 1) {
      const attachment = supportAttachments[index];
      const attachmentName = sanitizeText(attachment.name, 120) || `attachment-${index + 1}`;
      const storageFileName = sanitizeFileName(attachmentName, 120);
      const attachmentPath = `supportAttachments/${ticketRef.id}/${Date.now()}_${index}_${storageFileName}`;
      const downloadToken = crypto.randomUUID();
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
        url: buildStorageDownloadUrl(bucket.name, attachmentPath, downloadToken)
      });
    }

    const ticket = {
      id: ticketRef.id,
      userId: context.auth?.uid || null,
      username: sanitizeText(payload.username || userPayload.username, 64) || null,
      displayName: sanitizeText(payload.name || userPayload.displayName, 120) || null,
      email,
      category,
      title,
      description,
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
      createdAt: admin.firestore.Timestamp.fromMillis(now),
      updatedAt: admin.firestore.Timestamp.fromMillis(now)
    };

    await ticketRef.set(ticket, { merge: true });

    try {
      const transporter = getTransporter();
      const template = buildSupportEmail(ticket);
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
      functions.logger.warn('Support email notification failed', {
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
        functions.logger.warn('Failed to clean up uploaded support attachment', {
          ticketId: ticketRef.id,
          attachmentPath,
          message: cleanupError?.message || 'unknown'
        });
      }
    }));

    try {
      await ticketRef.delete();
    } catch (cleanupError) {
      functions.logger.warn('Failed to clean up support ticket after submission error', {
        ticketId: ticketRef.id,
        message: cleanupError?.message || 'unknown'
      });
    }

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    functions.logger.error('Support ticket submission failed', {
      ticketId: ticketRef.id,
      message: error?.message || 'unknown'
    });
    throw new functions.https.HttpsError(
      'internal',
      'Could not create the support ticket right now. Please try again.'
    );
  }
});

const updateSupportTicket = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const ticketId = sanitizeText(data?.ticketId || '', 128);
  if (!ticketId) {
    throw new functions.https.HttpsError('invalid-argument', 'Ticket id is required.');
  }

  const status = sanitizeText(data?.status || '', 32).toLowerCase();
  if (!SUPPORT_TICKET_STATUSES.has(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid support ticket status.');
  }

  const priority = sanitizeText(data?.priority || 'normal', 32).toLowerCase() || 'normal';
  if (!SUPPORT_TICKET_PRIORITIES.has(priority)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid support ticket priority.');
  }

  const adminResponse = sanitizeText(data?.adminResponse || '', 2000);
  const ticketRef = db.collection(SUPPORT_COLLECTION).doc(ticketId);
  const now = Date.now();
  let updatedTicket = null;

  await db.runTransaction(async (transaction) => {
    const ticketSnap = await transaction.get(ticketRef);
    if (!ticketSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Support ticket was not found.');
    }

    const currentTicket = ticketSnap.data() || {};
    const updatePayload = {
      status,
      priority,
      adminResponse,
      customerUnreadUpdate: true,
      customerUnreadUpdateCount: Number(currentTicket.customerUnreadUpdateCount || 0) + 1,
      updatedAt: admin.firestore.Timestamp.fromMillis(now),
      adminUpdatedAt: admin.firestore.Timestamp.fromMillis(now),
      adminUpdatedBy: context.auth.uid
    };

    transaction.set(ticketRef, updatePayload, { merge: true });
    updatedTicket = {
      ...currentTicket,
      ...updatePayload,
      id: ticketSnap.id
    };
  });

  try {
    const transporter = getTransporter();
    const template = buildSupportUpdateEmail(updatedTicket, status, adminResponse);
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
    functions.logger.warn('Support update email failed', {
      ticketId,
      message: error?.message || 'unknown'
    });
  }

  return { ticket: updatedTicket };
});

const markSupportTicketUpdatesSeen = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const ticketIds = Array.isArray(data?.ticketIds)
    ? data.ticketIds.map((ticketId) => sanitizeText(ticketId, 128)).filter(Boolean).slice(0, 50)
    : [];

  if (!ticketIds.length) {
    return { updatedCount: 0 };
  }

  const now = admin.firestore.Timestamp.fromMillis(Date.now());
  let updatedCount = 0;

  await db.runTransaction(async (transaction) => {
    const refs = ticketIds.map((ticketId) => db.collection(SUPPORT_COLLECTION).doc(ticketId));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));

    snapshots.forEach((ticketSnap) => {
      if (!ticketSnap.exists) return;
      const ticketData = ticketSnap.data() || {};
      if (ticketData.userId !== userId) return;
      if (!ticketData.customerUnreadUpdate) return;

      transaction.set(ticketSnap.ref, {
        customerUnreadUpdate: false,
        customerUnreadUpdateCount: 0,
        customerSeenAt: now,
        updatedAt: now
      }, { merge: true });
      updatedCount += 1;
    });
  });

  return { updatedCount };
});

const __private__ = {
  resolveSupportTicketInput
};

module.exports = {
  submitSupportTicket,
  updateSupportTicket,
  markSupportTicketUpdatesSeen,
  __private__
};




