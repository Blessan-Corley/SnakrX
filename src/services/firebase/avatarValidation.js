const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export const validateAvatarFile = (file) => {
  if (!file) return { valid: false, error: 'Please select an image file.' };
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WEBP images are allowed.' };
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { valid: false, error: 'Image size must be 5MB or smaller.' };
  }
  return { valid: true };
};

