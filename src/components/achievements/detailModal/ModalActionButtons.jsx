import { AnimatePresence, motion } from 'framer-motion';
import { Share2, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import { collectBurstOffsets } from '@/components/achievements/achievementPageUtils.js';

const ModalActionButtons = ({
  collectBurst,
  collectingAchievementId,
  getTierStyling,
  isAchievementUnlocked,
  onClose,
  onCollectAction,
  onShareAchievement,
  selectedCollectButtonLabel,
  selectedCollectableId,
  selectedIsChain,
  selectedChainTierStyling,
  selectedSingleAchievement,
  showAchievementModal
}) => (
  <div className="flex space-x-3">
    <Button variant="ghost" onClick={onClose} fullWidth>
      Close
    </Button>
    {selectedCollectableId ? (
      <div className="relative w-full">
        <AnimatePresence>
          {collectBurst && showAchievementModal && collectBurst.key && selectedCollectableId && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible">
              {collectBurstOffsets.map((offset, index) => (
                <motion.span
                  key={`${collectBurst.key}-${index}`}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: offset.x,
                    y: offset.y,
                    scale: [0.2, offset.scale, 0.1],
                    rotate: offset.rotate
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.48, delay: index * 0.018, ease: 'easeOut' }}
                  className="absolute h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: collectBurst.color, boxShadow: `0 0 12px ${collectBurst.color}` }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
        <Button
          variant="primary"
          icon={<Sparkles size={16} />}
          onClick={() => {
            onCollectAction({
              achievementId: selectedCollectableId,
              accentColor: selectedIsChain ? selectedChainTierStyling.color : getTierStyling(selectedSingleAchievement.tier).color,
              advanceChain: selectedIsChain
            });
          }}
          loading={collectingAchievementId === selectedCollectableId}
          fullWidth
          className="animate-pulse"
        >
          {selectedCollectButtonLabel}
        </Button>
      </div>
    ) : (!selectedIsChain && isAchievementUnlocked(selectedSingleAchievement.id) && (
      <Button
        variant="primary"
        icon={<Share2 size={16} />}
        onClick={() => {
          onShareAchievement(selectedSingleAchievement.id);
          onClose();
        }}
        fullWidth
      >
        Share
      </Button>
    ))}
  </div>
);

export default ModalActionButtons;
