const FIREBASE_STORAGE_APP_SUFFIX = '.firebasestorage.app';
const APPSPOT_SUFFIX = '.appspot.com';

export const normalizeStorageBucket = (bucket = '') => {
  const trimmedBucket = String(bucket || '').trim().replace(/^gs:\/\//, '').replace(/\/+$/, '');
  if (!trimmedBucket) return '';

  if (trimmedBucket.endsWith(FIREBASE_STORAGE_APP_SUFFIX)) {
    return `${trimmedBucket.slice(0, -FIREBASE_STORAGE_APP_SUFFIX.length)}${APPSPOT_SUFFIX}`;
  }

  return trimmedBucket;
};

export const toStorageBucketUrl = (bucket = '') => {
  const normalizedBucket = normalizeStorageBucket(bucket);
  return normalizedBucket ? `gs://${normalizedBucket}` : '';
};
