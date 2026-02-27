import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal.jsx';
import Button from '@/components/ui/Button.jsx';

const AchievementUnlockModal = ({
  isOpen,
  onClose,
  achievement,
  AchievementIcon,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Achievement Unlocked!" size="sm">
    {achievement && AchievementIcon && (
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="flex justify-center">
          <AchievementIcon size={56} className="text-amber-300" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
          <p className="text-white/70 mb-4">{achievement.description}</p>
        </div>
        <Button variant="primary" onClick={onClose} fullWidth>Awesome!</Button>
      </div>
    )}
  </Modal>
);

export default AchievementUnlockModal;
