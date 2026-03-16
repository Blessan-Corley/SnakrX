import { motion } from 'framer-motion';
import { CheckCircle, Lock, Share2, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import AchievementGridProgressBar from './AchievementGridProgressBar.jsx';
import { buildAchievementGridCardState } from './achievementGridState.js';

const AchievementGridCard = ({
  calculateAchievementProgress,
  collectingAchievementId,
  getTierStyling,
  index,
  isAchievementUnlocked,
  item,
  onAchievementClick,
  onCollect,
  onShareAchievement,
  uncollectedIds,
  userStats
}) => {
  const {
    Icon,
    achievement,
    isChain,
    isCollected,
    isUncollected,
    isUnlocked,
    progress,
    progressSnapshot,
    statusClassName,
    statusLabel,
    tierStyling,
    visualTier
  } = buildAchievementGridCardState({
    calculateAchievementProgress,
    getTierStyling,
    isAchievementUnlocked,
    item,
    uncollectedIds,
    userStats
  });

  if (!achievement) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        layout: { duration: 0.3 }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant="glass"
        clickable
        interactiveElement="div"
        onClick={() => onAchievementClick(item)}
        className={`group h-full transition-all duration-300 ${
          isUnlocked ? `shadow-lg ${tierStyling.glow}` : 'opacity-75 hover:opacity-90'
        }`}
        style={{
          borderColor: isUnlocked ? `${tierStyling.color}AA` : `${tierStyling.color}55`,
          background: isUnlocked
            ? `linear-gradient(145deg, ${tierStyling.color}1A, rgba(15, 23, 42, 0.72))`
            : `linear-gradient(145deg, ${tierStyling.color}0D, rgba(15, 23, 42, 0.66))`,
          boxShadow: isUnlocked
            ? `0 0 0 1px ${tierStyling.color}66, 0 14px 34px ${tierStyling.color}26`
            : `0 0 0 1px ${tierStyling.color}40`
        }}
      >
        <div className="relative p-4">
          {statusLabel && (
            <div className="absolute top-2 left-2">
              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${statusClassName}`}>
                {statusLabel}
              </span>
            </div>
          )}

          <div className="text-center mb-4">
            <div className="relative inline-flex">
              <div
                className="w-14 h-14 rounded-2xl border flex items-center justify-center"
                style={{
                  color: isUnlocked ? tierStyling.color : `${tierStyling.color}CC`,
                  borderColor: isUnlocked ? `${tierStyling.color}88` : `${tierStyling.color}55`,
                  background: isUnlocked ? `${tierStyling.color}1f` : `${tierStyling.color}12`
                }}
              >
                <Icon size={28} />
              </div>
              {!isUnlocked && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-white/30 flex items-center justify-center">
                  <Lock size={11} className="text-white/80" />
                </span>
              )}
            </div>
          </div>

          <div className="text-center mb-4">
            {isChain && (
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
                {item.chainTitle}
              </div>
            )}
            <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-white/70'}`}>
              {item.title || achievement.title}
            </h3>
            <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-white/80' : 'text-white/60'}`}>
              {item.description || achievement.description}
            </p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: `${tierStyling.color}20`, color: tierStyling.color }}
            >
              {visualTier}
            </span>
            <span className="text-primary-400 font-bold text-sm">
              +{achievement.points}
            </span>
          </div>

          {isChain && (
            <AchievementGridProgressBar
              color={tierStyling.color}
              currentText={
                item.displayTier?.isUncollected
                  ? 'Reward can be collected now'
                  : `${progressSnapshot.current}/${progressSnapshot.target}`
              }
              label={item.displayTier?.isUncollected ? 'Current Tier' : progressSnapshot.label}
              progress={progress}
              progressLabel={`Chain ${item.progressLabel}`}
            />
          )}

          {!isChain && !isUnlocked && progress > 0 && (
            <AchievementGridProgressBar
              color={tierStyling.color}
              currentText={`${progressSnapshot.current}/${progressSnapshot.target}`}
              label={progressSnapshot.label}
              progress={progress}
            />
          )}

          {isChain && item.displayTier?.isUncollected && (
            <div className="absolute top-2 right-2">
              <Button
                variant="primary"
                size="sm"
                onClick={async (event) => {
                  event.stopPropagation();
                  await onCollect({
                    achievementId: item.displayTier.id,
                    accentColor: tierStyling.color
                  });
                }}
                icon={<Sparkles size={16} />}
                className="animate-pulse"
                loading={collectingAchievementId === item.displayTier.id}
              >
                Collect
              </Button>
            </div>
          )}

          {!isChain && isUncollected && (
            <div className="absolute top-2 right-2">
              <Button
                variant="primary"
                size="sm"
                onClick={async (event) => {
                  event.stopPropagation();
                  await onCollect({
                    achievementId: achievement.id,
                    accentColor: tierStyling.color
                  });
                }}
                icon={<Sparkles size={16} />}
                className="animate-pulse"
                loading={collectingAchievementId === achievement.id}
              >
                Collect
              </Button>
            </div>
          )}

          {!isChain && isCollected && (
            <div className="absolute top-2 right-2">
              <CheckCircle size={20} className="text-green-400" />
            </div>
          )}

          {!isChain && isUnlocked && !uncollectedIds.has(achievement.id) && (
            <div className="absolute bottom-2 right-2">
              <Button
                variant="minimal"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onShareAchievement(achievement.id);
                }}
                icon={<Share2 size={14} />}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default AchievementGridCard;
