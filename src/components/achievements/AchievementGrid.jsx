import { AnimatePresence, motion } from 'framer-motion';
import { CardSkeleton } from '@/components/ui/LoadingSpinner.jsx';
import AchievementGridCard from './grid/AchievementGridCard.jsx';
import AchievementGridEmptyState from './grid/AchievementGridEmptyState.jsx';

const AchievementGrid = ({
  calculateAchievementProgress,
  collectingAchievementId,
  filteredAchievements,
  getTierStyling,
  isAchievementUnlocked,
  loading,
  onAchievementClick,
  onClearFilters,
  onCollect,
  onShareAchievement,
  searchTerm,
  showUnlockedOnly,
  uncollectedIds,
  userStats,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    ) : filteredAchievements.length === 0 ? (
      <AchievementGridEmptyState
        onClearFilters={onClearFilters}
        searchTerm={searchTerm}
        showUnlockedOnly={showUnlockedOnly}
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredAchievements.map((item, index) => (
            <AchievementGridCard
              key={item.id}
              calculateAchievementProgress={calculateAchievementProgress}
              collectingAchievementId={collectingAchievementId}
              getTierStyling={getTierStyling}
              index={index}
              isAchievementUnlocked={isAchievementUnlocked}
              item={item}
              onAchievementClick={onAchievementClick}
              onCollect={onCollect}
              onShareAchievement={onShareAchievement}
              uncollectedIds={uncollectedIds}
              userStats={userStats}
            />
          ))}
        </AnimatePresence>
      </div>
    )}
  </motion.div>
);

export default AchievementGrid;
