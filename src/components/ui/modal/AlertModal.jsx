import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import Button from '../Button';

const getAlertIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={48} className="text-green-500 mx-auto" />;
    case 'warning':
      return <AlertTriangle size={48} className="text-yellow-500 mx-auto" />;
    case 'error':
      return <XCircle size={48} className="text-red-500 mx-auto" />;
    case 'info':
    default:
      return <Info size={48} className="text-blue-500 mx-auto" />;
  }
};

const getAlertVariant = (type) => {
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

const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message = '',
  type = 'info',
  buttonText = 'OK',
  ...props
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="text-center mb-6">
        <div className="mb-4">{getAlertIcon(type)}</div>
        <p className="text-white/80">{message}</p>
      </div>

      <div className="flex justify-center">
        <Button
          variant={getAlertVariant(type)}
          onClick={onClose}
          fullWidth
        >
          {buttonText}
        </Button>
      </div>
    </BaseModal>
  );
};

export default AlertModal;
