import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Modal Component with SnakrX glass morphism design
 * Features backdrop blur, smooth animations, and keyboard accessibility
 */
const Modal = ({
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

  // Size configurations
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.75,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.75,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Modal JSX
  const modalJSX = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`
              relative w-full ${sizes[size]} 
              bg-gradient-card backdrop-blur-md 
              border border-white/20 rounded-2xl 
              shadow-2xl overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-primary-500/50
              ${className}
            `}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`
                flex items-center justify-between p-6 
                border-b border-white/10
                ${headerClassName}
              `}>
                {title && (
                  <h2 
                    id="modal-title"
                    className="text-xl font-semibold text-white"
                  >
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <Button
                    variant="minimal"
                    size="icon"
                    onClick={onClose}
                    icon={<X size={20} />}
                    className="text-white/70 hover:text-white ml-auto"
                    aria-label="Close modal"
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className={`p-6 ${contentClassName}`}>
              {children}
            </div>

            {/* Footer */}
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

  // Render modal in portal
  return createPortal(modalJSX, document.body);
};

/**
 * Confirmation Modal Component
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="mb-6">
        <p className="text-white/80">{message}</p>
      </div>
      
      <div className="flex space-x-3 justify-end">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

/**
 * Alert Modal Component
 */
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message = '',
  type = 'info',
  buttonText = 'OK',
  ...props
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'danger';
      case 'info':
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">{getIcon()}</div>
        <p className="text-white/80">{message}</p>
      </div>
      
      <div className="flex justify-center">
        <Button
          variant={getVariant()}
          onClick={onClose}
          fullWidth
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

/**
 * Achievement Modal Component
 */
export const AchievementModal = ({
  isOpen,
  onClose,
  achievement,
  ...props
}) => {
  if (!achievement) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Achievement Unlocked!"
      size="sm"
      className="text-center"
      {...props}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          damping: 15, 
          stiffness: 300,
          delay: 0.1 
        }}
        className="text-center mb-6"
      >
        <div className="text-6xl mb-4">{achievement.icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">
          {achievement.title}
        </h3>
        <p className="text-white/70 mb-4">
          {achievement.description}
        </p>
        <div className="flex items-center justify-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            achievement.tier === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
            achievement.tier === 'epic' ? 'bg-purple-500/20 text-purple-300' :
            achievement.tier === 'rare' ? 'bg-blue-500/20 text-blue-300' :
            achievement.tier === 'uncommon' ? 'bg-emerald-500/20 text-emerald-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {achievement.tier}
          </span>
          <span className="text-primary-400 font-bold">
            +{achievement.points} points
          </span>
        </div>
      </motion.div>
      
      <Button
        variant="ghost-primary"
        onClick={onClose}
        fullWidth
      >
        Awesome!
      </Button>
    </Modal>
  );
};

/**
 * Loading Modal Component
 */
export const LoadingModal = ({
  isOpen,
  title = 'Loading...',
  message = 'Please wait',
  ...props
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {}} // Prevent closing while loading
    title={title}
    size="sm"
    showCloseButton={false}
    closeOnBackdrop={false}
    closeOnEscape={false}
    {...props}
  >
    <div className="text-center py-8">
      <motion.div
        className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-white/70">{message}</p>
    </div>
  </Modal>
);

export default Modal;