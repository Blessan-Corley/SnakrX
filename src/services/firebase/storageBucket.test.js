import { describe, expect, it } from 'vitest';
import { normalizeStorageBucket, toStorageBucketUrl } from './storageBucket.js';

describe('storage bucket normalization', () => {
  it('converts firebasestorage.app buckets to appspot.com', () => {
    expect(normalizeStorageBucket('snakrx-23b0b.firebasestorage.app')).toBe('snakrx-23b0b.appspot.com');
  });

  it('removes a gs:// prefix before building a storage url', () => {
    expect(toStorageBucketUrl('gs://snakrx-23b0b.appspot.com')).toBe('gs://snakrx-23b0b.appspot.com');
  });

  it('leaves already-normalized appspot buckets unchanged', () => {
    expect(normalizeStorageBucket('snakrx-23b0b.appspot.com')).toBe('snakrx-23b0b.appspot.com');
  });
});
