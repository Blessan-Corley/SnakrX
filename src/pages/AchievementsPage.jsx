import { CheckCircle, Star } from 'lucide-react';
import AchievementCollectionsSection from '@/components/achievements/AchievementCollectionsSection.jsx';
import AchievementDetailModal from '@/components/achievements/AchievementDetailModal.jsx';
import AchievementFilters from '@/components/achievements/AchievementFilters.jsx';
import AchievementGrid from '@/components/achievements/AchievementGrid.jsx';
import AchievementsOverviewSection from '@/components/achievements/AchievementsOverviewSection.jsx';
import AchievementsPageBackground from '@/components/achievements/AchievementsPageBackground.jsx';
import AchievementsPageHeader from '@/components/achievements/AchievementsPageHeader.jsx';
import AchievementTierStats from '@/components/achievements/AchievementTierStats.jsx';
import UncollectedAchievementsBanner from '@/components/achievements/UncollectedAchievementsBanner.jsx';
import useAchievementsPageController from './achievements/useAchievementsPageController.js';

const AchievementsPage = () => {
  const {
    achievementStats,
    calculateAchievementProgress,
    categoryIcons,
    chainTransitionDirection,
    collectedAchievements,
    collectingAchievementId,
    collectBurst,
    collectAllAchievements,
    completionPercentage,
    filteredAchievements,
    getTierStyling,
    handleAchievementClick,
    handleCategoryChange,
    handleClearFilters,
    handleCollectAction,
    handleShareAchievement,
    handleToggleUnlockedOnly,
    isAchievementUnlocked,
    loading,
    navigateChainTier,
    recentUnlockCount,
    recentUncollectedUnlocks,
    searchTerm,
    selectedCard,
    selectedCategory,
    selectedChain,
    selectedChainTier,
    selectedChainTierIndex,
    selectedChainTierProgress,
    selectedChainTierStyling,
    selectedCollectButtonLabel,
    selectedCollectableId,
    selectedIsChain,
    selectedSingleAchievement,
    selectedTier,
    setSearchTerm,
    setSelectedTier,
    setShowAchievementModal,
    showAchievementModal,
    showUnlockedOnly,
    totalPoints,
    uncollectedAchievements,
    uncollectedIds,
    userStats
  } = useAchievementsPageController();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AchievementsPageBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <AchievementsPageHeader />

        <AchievementsOverviewSection
          achievementStats={achievementStats}
          completionPercentage={completionPercentage}
          totalPoints={totalPoints}
          recentUnlockCount={recentUnlockCount}
        />

        <UncollectedAchievementsBanner
          uncollectedAchievements={uncollectedAchievements}
          onCollectAll={() => collectAllAchievements()}
        />

        <AchievementFilters
          categoryIcons={categoryIcons}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedTier={selectedTier}
          showUnlockedOnly={showUnlockedOnly}
          onCategoryChange={handleCategoryChange}
          onSearchChange={setSearchTerm}
          onTierChange={setSelectedTier}
          onToggleUnlockedOnly={handleToggleUnlockedOnly}
        />

        <AchievementTierStats
          achievementStats={achievementStats}
          getTierStyling={getTierStyling}
        />

        <AchievementGrid
          calculateAchievementProgress={calculateAchievementProgress}
          collectingAchievementId={collectingAchievementId}
          filteredAchievements={filteredAchievements}
          getTierStyling={getTierStyling}
          isAchievementUnlocked={isAchievementUnlocked}
          loading={loading}
          onAchievementClick={handleAchievementClick}
          onClearFilters={handleClearFilters}
          onCollect={handleCollectAction}
          onShareAchievement={handleShareAchievement}
          searchTerm={searchTerm}
          showUnlockedOnly={showUnlockedOnly}
          uncollectedIds={uncollectedIds}
          userStats={userStats}
        />

        <AchievementCollectionsSection
          achievements={recentUncollectedUnlocks.slice(0, 6)}
          animateEach
          delay={0.5}
          onAchievementClick={handleAchievementClick}
          title="Recently Unlocked"
          titleIcon={<Star className="mr-2 text-amber-400" size={24} />}
        />

        <AchievementCollectionsSection
          achievements={collectedAchievements}
          countLabel={`${collectedAchievements.length} collected`}
          delay={0.55}
          onAchievementClick={handleAchievementClick}
          title="Collected Achievements"
          titleIcon={<CheckCircle className="mr-2 text-emerald-400" size={24} />}
        />
      </div>

      <AchievementDetailModal
        calculateAchievementProgress={calculateAchievementProgress}
        chainTransitionDirection={chainTransitionDirection}
        collectBurst={collectBurst}
        collectingAchievementId={collectingAchievementId}
        getTierStyling={getTierStyling}
        isAchievementUnlocked={isAchievementUnlocked}
        navigateChainTier={navigateChainTier}
        onClose={() => setShowAchievementModal(false)}
        onCollectAction={handleCollectAction}
        onShareAchievement={handleShareAchievement}
        selectedCard={selectedCard}
        selectedChain={selectedChain}
        selectedChainTier={selectedChainTier}
        selectedChainTierIndex={selectedChainTierIndex}
        selectedChainTierProgress={selectedChainTierProgress}
        selectedChainTierStyling={selectedChainTierStyling}
        selectedCollectButtonLabel={selectedCollectButtonLabel}
        selectedCollectableId={selectedCollectableId}
        selectedIsChain={selectedIsChain}
        selectedSingleAchievement={selectedSingleAchievement}
        showAchievementModal={showAchievementModal}
        userStats={userStats}
      />
    </div>
  );
};

export default AchievementsPage;
