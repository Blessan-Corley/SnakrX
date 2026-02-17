const SUPPORT_ATTACHMENT_MAX_COUNT = 3;
const SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const SUPPORT_ATTACHMENT_ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json'
]);

export const SUPPORT_ATTACHMENT_ACCEPT = Array.from(SUPPORT_ATTACHMENT_ALLOWED_TYPES).join(',');

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const readFileBuffer = async (file) => {
  if (typeof file?.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read attachment "${file?.name || 'file'}".`));
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
};

const formatBytes = (value) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateSupportAttachments = (files = []) => {
  if (!Array.isArray(files)) {
    return { valid: false, error: 'Invalid attachment selection.' };
  }

  if (files.length > SUPPORT_ATTACHMENT_MAX_COUNT) {
    return {
      valid: false,
      error: `You can upload up to ${SUPPORT_ATTACHMENT_MAX_COUNT} attachments per ticket.`
    };
  }

  let totalSize = 0;
  for (const file of files) {
    if (!file) {
      return { valid: false, error: 'One of the selected attachments is invalid.' };
    }

    if (!SUPPORT_ATTACHMENT_ALLOWED_TYPES.has(file.type)) {
      return {
        valid: false,
        error: `"${file.name}" is not supported. Use PNG, JPG, WEBP, GIF, PDF, TXT, CSV, or JSON.`
      };
    }

    if (file.size > SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `"${file.name}" is too large. Each file must be ${formatBytes(SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES)} or smaller.`
      };
    }

    totalSize += Number(file.size) || 0;
  }

  const totalSizeLimit = SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES * SUPPORT_ATTACHMENT_MAX_COUNT;
  if (totalSize > totalSizeLimit) {
    return {
      valid: false,
      error: `Selected attachments are too large in total. Keep the combined size under ${formatBytes(totalSizeLimit)}.`
    };
  }

  return { valid: true };
};

export const serializeSupportAttachments = async (files = []) => {
  const validation = validateSupportAttachments(files);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return Promise.all(files.map(async (file) => ({
    name: file.name,
    contentType: file.type,
    size: Number(file.size) || 0,
    dataBase64: arrayBufferToBase64(await readFileBuffer(file))
  })));
};

export const normalizeSupportAttachments = (ticket = {}) => {
  const attachments = Array.isArray(ticket.attachments)
    ? ticket.attachments.filter(Boolean)
    : [];

  if (attachments.length > 0) {
    return attachments.map((attachment) => ({
      name: attachment.name || 'Attachment',
      url: attachment.url || null,
      contentType: attachment.contentType || '',
      size: Number(attachment.size) || 0,
      path: attachment.path || null
    }));
  }

  return Array.isArray(ticket.attachmentNames)
    ? ticket.attachmentNames.filter(Boolean).map((name) => ({
      name,
      url: null,
      contentType: '',
      size: 0,
      path: null
    }))
    : [];
};

export {
  SUPPORT_ATTACHMENT_ALLOWED_TYPES,
  SUPPORT_ATTACHMENT_MAX_COUNT,
  SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES
};
