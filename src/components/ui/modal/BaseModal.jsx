import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../Button';
import { BACKDROP_VARIANTS, MODAL_SIZES, MODAL_VARIANTS } from './constants';
import { useModalBehavior } from './useModalBehavior';

const BaseModal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  footer = null,
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useModalBehavior({
    isOpen,
    closeOnEscape,
    onClose,
    modalRef,
    previousFocusRef
  });

  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const modalJSX = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={BACKDROP_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

          <motion.div
            ref={modalRef}
            className={`
              relative w-full ${MODAL_SIZES[size]}
              bg-gradient-card backdrop-blur-md
              border border-white/20 rounded-2xl
              shadow-2xl overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-primary-500/50
              ${className}
            `}
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            {...props}
          >
            {(title || showCloseButton) && (
              <div className={`
                flex items-center justify-between p-6
                border-b border-white/10
                ${headerClassName}
              `}>
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-white">
                    {title}
                  </h2>
                )}

                {showCloseButton && (
                  <Button
                    variant="minimal"
                    size="icon"
                    onClick={onClose}
                    icon={<X size={20} />}
                    aria-label="Close modal"
                    className="text-white/70 hover:text-white ml-auto"
                  />
                )}
              </div>
            )}

            <div className={`p-6 ${contentClassName}`}>
              {children}
            </div>

            {footer && (
              <div className={`
                px-6 py-4 bg-white/5
                border-t border-white/10
                ${footerClassName}
              `}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalJSX, document.body);
};

export default BaseModal;
