import { functions, httpsCallable } from './config.js';
import { validateAvatarFile } from './avatarValidation.js';

let uploadAvatarCallable;
let deleteAvatarCallable;

const getUploadAvatarCallable = () => {
  if (!uploadAvatarCallable) {
    uploadAvatarCallable = httpsCallable(functions, 'uploadUserAvatar');
  }
  return uploadAvatarCallable;
};

const getDeleteAvatarCallable = () => {
  if (!deleteAvatarCallable) {
    deleteAvatarCallable = httpsCallable(functions, 'deleteUserAvatar');
  }
  return deleteAvatarCallable;
};

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
    reader.onerror = () => reject(new Error('Unable to read avatar file.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
};

export const uploadUserAvatar = async ({ uid, file, previousAvatarPath = null }) => {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!uid) {
    throw new Error('Missing user id for avatar upload.');
  }

  const imageBase64 = arrayBufferToBase64(await readFileBuffer(file));
  const callable = getUploadAvatarCallable();
  const response = await callable({
    fileName: file.name,
    contentType: file.type,
    imageBase64,
    previousAvatarPath: previousAvatarPath || null
  });

  return response?.data || { avatar: null, avatarPath: null };
};

export const removeUserAvatar = async (avatarPath) => {
  if (!avatarPath) return;
  const callable = getDeleteAvatarCallable();
  await callable({ avatarPath });
};
