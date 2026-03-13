const { functions, admin, crypto } = require('./runtime');
const {
  AVATAR_MAX_BYTES,
  AVATAR_ALLOWED_TYPES,
  sanitizeText,
  sanitizeFileName,
  stripBase64Prefix,
  isAvatarPathOwnedByUser,
  buildStorageDownloadUrl,
} = require('./shared/utils');

const hasValidAvatarSignature = (buffer, contentType) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  if (contentType === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
  }

  if (contentType === 'image/jpeg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[buffer.length - 2] === 0xFF && buffer[buffer.length - 1] === 0xD9;
  }

  if (contentType === 'image/webp') {
    const riff = buffer.subarray(0, 4).toString('ascii');
    const webp = buffer.subarray(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }

  return false;
};

const uploadUserAvatar = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const contentType = sanitizeText(data?.contentType || '', 64).toLowerCase();
  if (!AVATAR_ALLOWED_TYPES.has(contentType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Unsupported avatar file type.');
  }

  const imageBase64 = stripBase64Prefix(data?.imageBase64);
  if (!imageBase64) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing avatar image data.');
  }

  let imageBuffer;
  try {
    imageBuffer = Buffer.from(imageBase64, 'base64');
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid avatar image payload.');
  }

  if (!imageBuffer.length || imageBuffer.length > AVATAR_MAX_BYTES) {
    throw new functions.https.HttpsError('invalid-argument', 'Avatar image exceeds the allowed size.');
  }

  if (!hasValidAvatarSignature(imageBuffer, contentType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Avatar image content does not match the declared file type.');
  }

  const bucket = admin.storage().bucket();
  const fileName = sanitizeFileName(data?.fileName || 'avatar');
  const avatarPath = `avatars/${userId}/${Date.now()}_${fileName}`;
  const downloadToken = crypto.randomUUID();
  const file = bucket.file(avatarPath);

  await file.save(imageBuffer, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: 'public,max-age=3600',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });

  const previousAvatarPath = sanitizeText(data?.previousAvatarPath || '', 260);
  if (previousAvatarPath && previousAvatarPath !== avatarPath && isAvatarPathOwnedByUser(previousAvatarPath, userId)) {
    try {
      await bucket.file(previousAvatarPath).delete({ ignoreNotFound: true });
    } catch (error) {
      functions.logger.warn('Failed to delete previous avatar during replacement', {
        userId,
        previousAvatarPath,
        message: error?.message || 'unknown'
      });
    }
  }

  return {
    avatarPath,
    avatar: buildStorageDownloadUrl(bucket.name, avatarPath, downloadToken)
  };
});

const deleteUserAvatar = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const avatarPath = sanitizeText(data?.avatarPath || '', 260);
  if (!avatarPath) {
    return { success: true };
  }

  if (!isAvatarPathOwnedByUser(avatarPath, userId)) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot delete another user avatar.');
  }

  await admin.storage().bucket().file(avatarPath).delete({ ignoreNotFound: true });
  return { success: true };
});

const __private__ = {
  hasValidAvatarSignature
};

module.exports = {
  uploadUserAvatar,
  deleteUserAvatar,
  __private__
};

