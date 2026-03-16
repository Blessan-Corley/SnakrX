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
  const modalSize = selectedIsChain ? '3xl' : 'xl';

  return (
    <Modal
      isOpen={showAchievementModal}
      onClose={onClose}
      title="Achievement Details"
      size={modalSize}
      className={selectedIsChain ? 'max-h-[88vh]' : 'max-h-[92vh]'}
      headerClassName={selectedIsChain ? 'px-5 py-4 sm:px-6 sm:py-4' : ''}
      contentClassName={selectedIsChain
        ? 'overflow-y-auto px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-3'
        : 'overflow-y-auto px-4 py-5 sm:p-6'}
    >
      {selectedCard && (
        <div className={selectedIsChain ? 'space-y-3' : 'text-center space-y-4'}>
          {!selectedIsChain && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex items-center justify-center text-white"
            >
              <SelectedIcon size={40} />
            </motion.div>
          )}

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
