import { motion } from 'framer-motion';
import { getIconComponent } from '@/utils/iconMap';
import BaseModal from './BaseModal';
import Button from '../Button';

const getTierClass = (tier) => {
  if (tier === 'legendary') return 'bg-amber-500/20 text-amber-300';
  if (tier === 'epic') return 'bg-purple-500/20 text-purple-300';
  if (tier === 'rare') return 'bg-blue-500/20 text-blue-300';
  if (tier === 'uncommon') return 'bg-emerald-500/20 text-emerald-300';
  return 'bg-gray-500/20 text-gray-300';
};

const AchievementModal = ({
  isOpen,
  onClose,
  achievement,
  ...props
}) => {
  if (!achievement) return null;

  const Icon = getIconComponent(achievement.icon);

  return (
    <BaseModal
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
          type: 'spring',
          damping: 15,
          stiffness: 300,
          delay: 0.1
        }}
        className="text-center mb-6"
      >
        <div className="text-6xl mb-4 flex items-center justify-center text-white">
          <Icon size={52} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {achievement.title}
        </h3>
        <p className="text-white/70 mb-4">
          {achievement.description}
        </p>
        <div className="flex items-center justify-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm ${getTierClass(achievement.tier)}`}>
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
    </BaseModal>
  );
};

export default AchievementModal;
