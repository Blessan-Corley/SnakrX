const { functions } = require('../runtime');
const {
  SUPPORT_ATTACHMENT_ALLOWED_TYPES,
  SUPPORT_ATTACHMENT_MAX_BYTES,
  SUPPORT_ATTACHMENT_MAX_COUNT,
  SUPPORT_ATTACHMENT_TOTAL_BYTES
} = require('./constants');
const { sanitizeText, stripBase64Prefix } = require('./coreUtils');

const sanitizeSupportAttachments = (attachments = []) => {
  if (!Array.isArray(attachments)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid support attachment payload.');
  }

  if (attachments.length > SUPPORT_ATTACHMENT_MAX_COUNT) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `You can upload up to ${SUPPORT_ATTACHMENT_MAX_COUNT} support attachments per ticket.`
    );
  }

  let totalBytes = 0;

  return attachments.map((attachment, index) => {
    const attachmentName = sanitizeText(attachment?.name || '', 120) || `attachment-${index + 1}`;
    const contentType = sanitizeText(attachment?.contentType || '', 120).toLowerCase();

    if (!SUPPORT_ATTACHMENT_ALLOWED_TYPES.has(contentType)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Attachment "${attachmentName}" uses an unsupported file type.`
      );
    }

    const dataBase64 = stripBase64Prefix(attachment?.dataBase64);
    if (!dataBase64) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Attachment "${attachmentName}" is missing file data.`
      );
    }

    let buffer;
    try {
      buffer = Buffer.from(dataBase64, 'base64');
    } catch (_error) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Attachment "${attachmentName}" contains invalid file data.`
      );
    }

    if (!buffer.length) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Attachment "${attachmentName}" is empty.`
      );
    }

    if (buffer.length > SUPPORT_ATTACHMENT_MAX_BYTES) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Attachment "${attachmentName}" exceeds the ${Math.round(SUPPORT_ATTACHMENT_MAX_BYTES / (1024 * 1024))} MB limit.`
      );
    }

    const reportedSize = Math.max(0, Math.floor(Number(attachment?.size) || 0));
    if (reportedSize && Math.abs(reportedSize - buffer.length) > 32) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Attachment "${attachmentName}" size metadata does not match its content.`
      );
    }

    totalBytes += buffer.length;
    if (totalBytes > SUPPORT_ATTACHMENT_TOTAL_BYTES) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Combined support attachment size exceeds the allowed limit.'
      );
    }

    return {
      name: attachmentName,
      contentType,
      size: buffer.length,
      buffer
    };
  });
};

module.exports = {
  sanitizeSupportAttachments
};
