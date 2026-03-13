import { beforeEach, describe, expect, it, vi } from 'vitest';
import { removeUserAvatar, uploadUserAvatar } from './profileAvatar.js';
import { validateAvatarFile } from './avatarValidation.js';

const mockUploadCallable = vi.fn();
const mockDeleteCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: vi.fn((_, name) => {
    if (name === 'uploadUserAvatar') return mockUploadCallable;
    if (name === 'deleteUserAvatar') return mockDeleteCallable;
    return vi.fn();
  })
}));

const createFileLike = (overrides = {}) => ({
  type: 'image/png',
  size: 1024,
  name: 'avatar.png',
  arrayBuffer: vi.fn(async () => Uint8Array.from([1, 2, 3, 4]).buffer),
  ...overrides
});

describe('validateAvatarFile', () => {
  it('rejects missing file', () => {
    const result = validateAvatarFile(null);
    expect(result.valid).toBe(false);
  });

  it('rejects unsupported file types', () => {
    const result = validateAvatarFile(createFileLike({ type: 'application/pdf' }));
    expect(result.valid).toBe(false);
  });

  it('rejects files larger than 5MB', () => {
    const result = validateAvatarFile(createFileLike({ size: 6 * 1024 * 1024 }));
    expect(result.valid).toBe(false);
  });

  it('accepts supported images within size limits', () => {
    const result = validateAvatarFile(createFileLike({ type: 'image/webp', size: 1000 }));
    expect(result.valid).toBe(true);
  });
});

describe('profileAvatar service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads avatars through the callable function', async () => {
    mockUploadCallable.mockResolvedValue({
      data: {
        avatar: 'https://example.com/avatar.webp',
        avatarPath: 'avatars/user-1/123_avatar.webp'
      }
    });

    const result = await uploadUserAvatar({
      uid: 'user-1',
      file: createFileLike({ name: 'avatar.webp', type: 'image/webp' }),
      previousAvatarPath: 'avatars/user-1/older.webp'
    });

    expect(mockUploadCallable).toHaveBeenCalledWith({
      fileName: 'avatar.webp',
      contentType: 'image/webp',
      imageBase64: 'AQIDBA==',
      previousAvatarPath: 'avatars/user-1/older.webp'
    });
    expect(result).toEqual({
      avatar: 'https://example.com/avatar.webp',
      avatarPath: 'avatars/user-1/123_avatar.webp'
    });
  });

  it('requires a user id before upload', async () => {
    await expect(uploadUserAvatar({
      uid: '',
      file: createFileLike()
    })).rejects.toThrow('Missing user id for avatar upload.');

    expect(mockUploadCallable).not.toHaveBeenCalled();
  });

  it('deletes avatars through the callable function', async () => {
    mockDeleteCallable.mockResolvedValue({ data: { success: true } });

    await removeUserAvatar('avatars/user-1/current.webp');

    expect(mockDeleteCallable).toHaveBeenCalledWith({
      avatarPath: 'avatars/user-1/current.webp'
    });
  });

  it('skips delete calls when there is no avatar path', async () => {
    await removeUserAvatar('');
    expect(mockDeleteCallable).not.toHaveBeenCalled();
  });
});
