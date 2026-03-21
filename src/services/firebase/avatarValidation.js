const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp'
]);

export const normalizeAvatarMimeType = (type = '') => {
  const normalizedType = String(type || '').trim().toLowerCase();

  if (normalizedType === 'image/jpg' || normalizedType === 'image/pjpeg') {
    return 'image/jpeg';
  }

  return normalizedType;
};

export const validateAvatarFile = (file) => {
  if (!file) return { valid: false, error: 'Please select an image file.' };

  const normalizedType = normalizeAvatarMimeType(file.type);
  if (!ALLOWED_AVATAR_TYPES.has(normalizedType)) {
    return { valid: false, error: 'Only JPG, PNG, and WEBP images are allowed.' };
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { valid: false, error: 'Image size must be 5MB or smaller.' };
  }
  return { valid: true };
};
