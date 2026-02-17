import { motion } from 'framer-motion';
import BaseModal from './BaseModal';

const LoadingModal = ({
  isOpen,
  title = 'Loading...',
  message = 'Please wait',
  ...props
}) => (
  <BaseModal
    isOpen={isOpen}
    onClose={() => {}}
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
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-white/70">{message}</p>
    </div>
  </BaseModal>
);

export default LoadingModal;
