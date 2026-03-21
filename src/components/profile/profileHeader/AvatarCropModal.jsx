import { useEffect, useMemo, useRef, useState } from 'react';
import BaseModal from '@/components/ui/Modal';
import Button from '@/components/ui/Button.jsx';
import {
  AVATAR_CROP_FRAME_SIZE,
  AVATAR_OUTPUT_SIZE,
  buildAvatarUploadFileName,
  clampAvatarCropPosition,
  getAvatarSourceRect,
  getMinimumAvatarZoom
} from './avatarCropUtils.js';

const createCroppedAvatarFile = async ({
  file,
  image,
  imageWidth,
  imageHeight,
  zoom,
  offsetX,
  offsetY
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Avatar editor is not available in this browser.');
  }

  const { sx, sy, sWidth, sHeight } = getAvatarSourceRect({
    imageWidth,
    imageHeight,
    cropSize: AVATAR_CROP_FRAME_SIZE,
    zoom,
    offsetX,
    offsetY
  });

  context.drawImage(
    image,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (nextBlob) {
          resolve(nextBlob);
          return;
        }

        reject(new Error('Unable to prepare avatar image.'));
      },
      'image/png',
      0.92
    );
  });

  return new File([blob], buildAvatarUploadFileName(file?.name, 'png'), {
    type: 'image/png'
  });
};

const AvatarCropModal = ({
  file,
  isOpen,
  onClose,
  onConfirm,
  submitting = false
}) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef(null);
  const dragOriginRef = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (!file || !isOpen) {
      setPreviewUrl('');
      setImageSize({ width: 0, height: 0 });
      setZoom(1);
      setOffset({ offsetX: 0, offsetY: 0 });
      setError('');
      imageRef.current = null;
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError('');

    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
      setZoom(getMinimumAvatarZoom(
        image.naturalWidth,
        image.naturalHeight,
        AVATAR_CROP_FRAME_SIZE
      ));
      setOffset({ offsetX: 0, offsetY: 0 });
    };
    image.onerror = () => {
      imageRef.current = null;
      setError('This image could not be loaded. Try a different PNG, JPG, or WEBP file.');
    };
    image.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen]);

  const minZoom = useMemo(
    () => getMinimumAvatarZoom(imageSize.width, imageSize.height, AVATAR_CROP_FRAME_SIZE),
    [imageSize.height, imageSize.width]
  );

  const maxZoom = useMemo(() => Math.max(minZoom * 3, minZoom + 1), [minZoom]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const handlePointerMove = (event) => {
      const nextPosition = clampAvatarCropPosition({
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        cropSize: AVATAR_CROP_FRAME_SIZE,
        zoom,
        offsetX: dragOriginRef.current.offsetX + (event.clientX - dragOriginRef.current.pointerX),
        offsetY: dragOriginRef.current.offsetY + (event.clientY - dragOriginRef.current.pointerY)
      });

      setOffset(nextPosition);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [imageSize.height, imageSize.width, isDragging, zoom]);

  const handlePointerDown = (event) => {
    if (!imageRef.current || submitting) return;

    event.preventDefault();
    dragOriginRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.offsetX,
      offsetY: offset.offsetY
    };
    setIsDragging(true);
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);
    setZoom(nextZoom);
    setOffset((previous) => clampAvatarCropPosition({
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      cropSize: AVATAR_CROP_FRAME_SIZE,
      zoom: nextZoom,
      offsetX: previous.offsetX,
      offsetY: previous.offsetY
    }));
  };

  const handleConfirm = async () => {
    if (!file || !imageRef.current || submitting) return;

    const croppedFile = await createCroppedAvatarFile({
      file,
      image: imageRef.current,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      zoom,
      offsetX: offset.offsetX,
      offsetY: offset.offsetY
    });

    await onConfirm?.(croppedFile);
  };

  const isReady = !!file && !!previewUrl && !!imageRef.current && !error;
  const displayedWidth = imageSize.width * zoom;
  const displayedHeight = imageSize.height * zoom;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={submitting ? undefined : onClose}
      title="Adjust Profile Photo"
      size="lg"
      closeOnBackdrop={!submitting}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-white/80">
            Preview your avatar before saving. Drag to reposition and use zoom to frame it properly.
          </p>
          <p className="text-white/50 text-sm">
            Supported input formats: PNG, JPG/JPEG, and WEBP. Uploads are normalized for a consistent avatar result.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex justify-center">
            <div
              className="relative select-none touch-none"
              style={{ width: AVATAR_CROP_FRAME_SIZE, height: AVATAR_CROP_FRAME_SIZE }}
            >
              <div className="absolute inset-0 rounded-[2rem] border border-white/15 bg-slate-950/70 shadow-2xl overflow-hidden">
                {previewUrl && !error && (
                  <img
                    src={previewUrl}
                    alt="Avatar crop preview"
                    className="absolute max-w-none pointer-events-none"
                    style={{
                      width: displayedWidth,
                      height: displayedHeight,
                      left: `calc(50% + ${offset.offsetX}px)`,
                      top: `calc(50% + ${offset.offsetY}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
                <button
                  type="button"
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  onPointerDown={handlePointerDown}
                  aria-label="Drag avatar to reposition crop"
                />
                <div className="absolute inset-0 rounded-[2rem] ring-2 ring-primary-400/70 ring-offset-2 ring-offset-slate-950/80 pointer-events-none" />
                <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_0_9999px_rgba(2,6,23,0.22)] pointer-events-none" />
                <div className="absolute inset-[14%] rounded-full border border-white/25 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Zoom</span>
                <span>{zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={Math.max((maxZoom - minZoom) / 100, 0.01)}
                value={zoom}
                onChange={handleZoomChange}
                disabled={!isReady || submitting}
                className="w-full accent-primary-500"
                aria-label="Avatar zoom"
              />
              <p className="text-xs text-white/45">
                Drag inside the frame to move the photo. The highlighted area is what will be saved.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white/75 text-sm font-medium">{file?.name || 'No file selected'}</p>
              <p className="text-white/45 text-xs mt-1">
                {file?.type || 'Unknown type'}{file?.size ? ` · ${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={submitting} disabled={!isReady || submitting}>
            Save Photo
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default AvatarCropModal;
