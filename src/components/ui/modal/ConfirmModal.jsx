import BaseModal from './BaseModal';
import Button from '../Button';

const ConfirmModal = ({
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
    <BaseModal
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
    </BaseModal>
  );
};

export default ConfirmModal;
