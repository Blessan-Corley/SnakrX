import { describe, expect, it, vi } from 'vitest';
import {
  normalizeSupportAttachments,
  serializeSupportAttachments,
  SUPPORT_ATTACHMENT_ACCEPT,
  validateSupportAttachments
} from './supportAttachments.js';

const createFileLike = (overrides = {}) => ({
  name: 'evidence.png',
  type: 'image/png',
  size: 1024,
  arrayBuffer: vi.fn(async () => Uint8Array.from([1, 2, 3, 4]).buffer),
  ...overrides
});

describe('support attachment validation', () => {
  it('accepts supported attachments within limits', () => {
    expect(validateSupportAttachments([createFileLike()])).toEqual({ valid: true });
  });

  it('rejects unsupported file types', () => {
    const result = validateSupportAttachments([createFileLike({ type: 'application/zip', name: 'logs.zip' })]);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not supported/i);
  });

  it('rejects oversized files', () => {
    const result = validateSupportAttachments([createFileLike({ size: 3 * 1024 * 1024 })]);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });
});

describe('support attachment serialization', () => {
  it('serializes files into callable payloads', async () => {
    const payload = await serializeSupportAttachments([createFileLike()]);

    expect(payload).toEqual([
      {
        name: 'evidence.png',
        contentType: 'image/png',
        size: 1024,
        dataBase64: 'AQIDBA=='
      }
    ]);
  });

  it('exposes the file input accept string', () => {
    expect(SUPPORT_ATTACHMENT_ACCEPT).toContain('application/pdf');
    expect(SUPPORT_ATTACHMENT_ACCEPT).toContain('image/png');
  });
});

describe('support attachment normalization', () => {
  it('prefers full attachment metadata when present', () => {
    expect(normalizeSupportAttachments({
      attachments: [
        {
          name: 'screenshot.png',
          url: 'https://example.com/screenshot.png',
          contentType: 'image/png',
          size: 4000,
          path: 'supportAttachments/ticket-1/screenshot.png'
        }
      ]
    })).toEqual([
      {
        name: 'screenshot.png',
        url: 'https://example.com/screenshot.png',
        contentType: 'image/png',
        size: 4000,
        path: 'supportAttachments/ticket-1/screenshot.png'
      }
    ]);
  });

  it('falls back to attachment names for legacy tickets', () => {
    expect(normalizeSupportAttachments({
      attachmentNames: ['proof.png']
    })).toEqual([
      {
        name: 'proof.png',
        url: null,
        contentType: '',
        size: 0,
        path: null
      }
    ]);
  });
});
