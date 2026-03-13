// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let hasValidAvatarSignature;

beforeAll(async () => {
  const avatarModule = await import('./avatar.js');
  ({ hasValidAvatarSignature } = (avatarModule.default ?? avatarModule).__private__);
});

describe('avatar helpers', () => {
  it('accepts valid PNG payloads', () => {
    const pngBuffer = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
      Buffer.alloc(16, 0)
    ]);

    expect(hasValidAvatarSignature(pngBuffer, 'image/png')).toBe(true);
  });

  it('accepts valid JPEG payloads', () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0xFF, 0xD9]);

    expect(hasValidAvatarSignature(jpegBuffer, 'image/jpeg')).toBe(true);
  });

  it('rejects mismatched or malformed payloads', () => {
    const invalidBuffer = Buffer.alloc(12, 0);

    expect(hasValidAvatarSignature(invalidBuffer, 'image/png')).toBe(false);
    expect(hasValidAvatarSignature(invalidBuffer, 'image/webp')).toBe(false);
    expect(hasValidAvatarSignature(Buffer.from([0x89, 0x50]), 'image/png')).toBe(false);
  });
});
