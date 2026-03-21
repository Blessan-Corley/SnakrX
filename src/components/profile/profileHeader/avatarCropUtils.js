export const AVATAR_CROP_FRAME_SIZE = 280;
export const AVATAR_OUTPUT_SIZE = 512;
export const AVATAR_INPUT_ACCEPT = '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeZero = (value) => (Object.is(value, -0) ? 0 : value);

export const getMinimumAvatarZoom = (imageWidth, imageHeight, cropSize = AVATAR_CROP_FRAME_SIZE) => {
  if (!Number.isFinite(imageWidth) || !Number.isFinite(imageHeight) || imageWidth <= 0 || imageHeight <= 0) {
    return 1;
  }

  return Math.max(cropSize / imageWidth, cropSize / imageHeight);
};

export const clampAvatarCropPosition = ({
  imageWidth,
  imageHeight,
  cropSize = AVATAR_CROP_FRAME_SIZE,
  zoom,
  offsetX,
  offsetY
}) => {
  const safeZoom = Math.max(Number(zoom) || 1, getMinimumAvatarZoom(imageWidth, imageHeight, cropSize));
  const displayedWidth = imageWidth * safeZoom;
  const displayedHeight = imageHeight * safeZoom;
  const maxOffsetX = Math.max(0, (displayedWidth - cropSize) / 2);
  const maxOffsetY = Math.max(0, (displayedHeight - cropSize) / 2);

  return {
    offsetX: normalizeZero(clamp(Number(offsetX) || 0, -maxOffsetX, maxOffsetX)),
    offsetY: normalizeZero(clamp(Number(offsetY) || 0, -maxOffsetY, maxOffsetY))
  };
};

export const getAvatarSourceRect = ({
  imageWidth,
  imageHeight,
  cropSize = AVATAR_CROP_FRAME_SIZE,
  zoom,
  offsetX,
  offsetY
}) => {
  const safeZoom = Math.max(Number(zoom) || 1, getMinimumAvatarZoom(imageWidth, imageHeight, cropSize));
  const { offsetX: clampedOffsetX, offsetY: clampedOffsetY } = clampAvatarCropPosition({
    imageWidth,
    imageHeight,
    cropSize,
    zoom: safeZoom,
    offsetX,
    offsetY
  });
  const displayedWidth = imageWidth * safeZoom;
  const displayedHeight = imageHeight * safeZoom;
  const left = (cropSize - displayedWidth) / 2 + clampedOffsetX;
  const top = (cropSize - displayedHeight) / 2 + clampedOffsetY;
  const sx = clamp((-left) / safeZoom, 0, imageWidth);
  const sy = clamp((-top) / safeZoom, 0, imageHeight);
  const sWidth = clamp(cropSize / safeZoom, 1, imageWidth - sx);
  const sHeight = clamp(cropSize / safeZoom, 1, imageHeight - sy);

  return {
    sx,
    sy,
    sWidth,
    sHeight
  };
};

export const buildAvatarUploadFileName = (originalName = 'avatar.png', extension = 'png') => {
  const baseName = String(originalName || 'avatar')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'avatar';

  return `${baseName}.${extension}`;
};
