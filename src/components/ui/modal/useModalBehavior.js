import { useEffect } from 'react';
import { acquireBodyScrollLock, releaseBodyScrollLock } from '@/utils/bodyScrollLock.js';

export const useModalBehavior = ({
  isOpen,
  closeOnEscape,
  onClose,
  modalRef,
  previousFocusRef
}) => {
  const scrollLockOwner = modalRef;

  useEffect(() => {
    let focusFrameId = null;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const handleKeyDown = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !isOpen || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(focusableSelector)
      ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || activeElement === modalRef.current)) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      previousFocusRef.current = document.activeElement;
      focusFrameId = window.requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    }

    return () => {
      if (focusFrameId !== null) {
        window.cancelAnimationFrame(focusFrameId);
      }
      document.removeEventListener('keydown', handleKeyDown);
      if (typeof previousFocusRef.current?.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose, modalRef, previousFocusRef]);

  useEffect(() => {
    if (!isOpen) return undefined;
    acquireBodyScrollLock(scrollLockOwner);
    return () => {
      releaseBodyScrollLock(scrollLockOwner);
    };
  }, [isOpen, scrollLockOwner]);
};
