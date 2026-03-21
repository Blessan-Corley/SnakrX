import { describe, expect, it } from 'vitest';
import {
  AVATAR_CROP_FRAME_SIZE,
  buildAvatarUploadFileName,
  clampAvatarCropPosition,
  getAvatarSourceRect,
  getMinimumAvatarZoom
} from './avatarCropUtils.js';

describe('avatarCropUtils', () => {
  it('computes the minimum zoom needed to cover the crop frame', () => {
    expect(getMinimumAvatarZoom(1000, 500, 250)).toBe(0.5);
    expect(getMinimumAvatarZoom(200, 400, 200)).toBe(1);
  });

  it('clamps crop offsets so the image always covers the frame', () => {
    expect(clampAvatarCropPosition({
      imageWidth: 800,
      imageHeight: 400,
      cropSize: 200,
      zoom: 0.5,
      offsetX: 200,
      offsetY: -80
    })).toEqual({
      offsetX: 100,
      offsetY: 0
    });
  });

  it('derives a valid source rectangle from crop state', () => {
    expect(getAvatarSourceRect({
      imageWidth: 800,
      imageHeight: 400,
      cropSize: 200,
      zoom: 0.5,
      offsetX: 50,
      offsetY: 0
    })).toEqual({
      sx: 100,
      sy: 0,
      sWidth: 400,
      sHeight: 400
    });
  });

  it('uses a stable png file name for processed avatars', () => {
    expect(buildAvatarUploadFileName('my photo.jpeg')).toBe('my-photo.png');
    expect(buildAvatarUploadFileName('', 'webp')).toBe('avatar.webp');
  });

  it('exports the configured crop frame size', () => {
    expect(AVATAR_CROP_FRAME_SIZE).toBeGreaterThan(0);
  });
});
