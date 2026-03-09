import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal.jsx';
import { getIconComponent } from '@/utils/iconMap.js';
import ChainAchievementDetail from './detailModal/ChainAchievementDetail.jsx';
import ModalActionButtons from './detailModal/ModalActionButtons.jsx';
import SingleAchievementDetail from './detailModal/SingleAchievementDetail.jsx';

const AchievementDetailModal = ({
  calculateAchievementProgress,
  chainTransitionDirection,
  collectBurst,
  collectingAchievementId,
  getTierStyling,
  isAchievementUnlocked,
  navigateChainTier,
  onClose,
  onCollectAction,
  onShareAchievement,
  selectedCard,
  selectedChain,
  selectedChainTier,
  selectedChainTierIndex,
  selectedChainTierProgress,
  selectedChainTierStyling,
  selectedCollectButtonLabel,
  selectedCollectableId,
  selectedIsChain,
  selectedSingleAchievement,
  showAchievementModal,
  userStats,
}) => {
  const SelectedIcon = selectedCard
    ? getIconComponent(selectedIsChain ? selectedChainTier.icon : selectedSingleAchievement.icon)
    : null;

  return (
    <Modal
      isOpen={showAchievementModal}
      onClose={onClose}
      title="Achievement Details"
      size="xl"
      className="max-h-[90vh]"
      contentClassName="overflow-y-auto px-4 py-5 sm:p-6"
    >
      {selectedCard && (
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center text-white"
          >
            <SelectedIcon size={40} />
          </motion.div>

          {selectedIsChain ? (
            <ChainAchievementDetail
              chainTransitionDirection={chainTransitionDirection}
              getTierStyling={getTierStyling}
              navigateChainTier={navigateChainTier}
              selectedChain={selectedChain}
              selectedChainTier={selectedChainTier}
              selectedChainTierIndex={selectedChainTierIndex}
              selectedChainTierProgress={selectedChainTierProgress}
              selectedChainTierStyling={selectedChainTierStyling}
              userStats={userStats}
            />
          ) : (
            <SingleAchievementDetail
              calculateAchievementProgress={calculateAchievementProgress}
              getTierStyling={getTierStyling}
              isAchievementUnlocked={isAchievementUnlocked}
              selectedSingleAchievement={selectedSingleAchievement}
              userStats={userStats}
            />
          )}

          <ModalActionButtons
            collectBurst={collectBurst}
            collectingAchievementId={collectingAchievementId}
            getTierStyling={getTierStyling}
            isAchievementUnlocked={isAchievementUnlocked}
            onClose={onClose}
            onCollectAction={onCollectAction}
            onShareAchievement={onShareAchievement}
            selectedChainTierStyling={selectedChainTierStyling}
            selectedCollectButtonLabel={selectedCollectButtonLabel}
            selectedCollectableId={selectedCollectableId}
            selectedIsChain={selectedIsChain}
            selectedSingleAchievement={selectedSingleAchievement}
            showAchievementModal={showAchievementModal}
          />
        </div>
      )}
    </Modal>
  );
};

export default AchievementDetailModal;
