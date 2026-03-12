import LeaderboardEntriesSection from './leaderboard/LeaderboardEntriesSection.jsx';
import LeaderboardFiltersSection from './leaderboard/LeaderboardFiltersSection.jsx';
import LeaderboardPageHeader from './leaderboard/LeaderboardPageHeader.jsx';
import LeaderboardStatsSection from './leaderboard/LeaderboardStatsSection.jsx';
import { useLeaderboardController } from './leaderboard/useLeaderboardController.js';

const LeaderboardPage = () => {
  const {
    selectedMode,
    searchTerm,
    entries,
    loading,
    error,
    activeTargetId,
    stats,
    activeWeekKey,
    isAchievementMode,
    isOverallMode,
    isWeeklyMode,
    getDisplayName,
    handleModeSelect,
    handleRefresh,
    setSearchTerm,
    handleSendInvite,
    handleOpenProfile
  } = useLeaderboardController();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-dark" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <LeaderboardPageHeader isWeeklyMode={isWeeklyMode} activeWeekKey={activeWeekKey} />
        <LeaderboardStatsSection
          stats={stats}
          isAchievementMode={isAchievementMode}
          isWeeklyMode={isWeeklyMode}
        />
        <LeaderboardFiltersSection
          selectedMode={selectedMode}
          searchTerm={searchTerm}
          loading={loading}
          onModeSelect={handleModeSelect}
          onSearchTermChange={setSearchTerm}
          onRefresh={handleRefresh}
        />
        <LeaderboardEntriesSection
          loading={loading}
          error={error}
          entries={entries}
          selectedMode={selectedMode}
          isAchievementMode={isAchievementMode}
          isOverallMode={isOverallMode}
          activeTargetId={activeTargetId}
          getDisplayName={getDisplayName}
          onOpenProfile={handleOpenProfile}
          onSendInvite={handleSendInvite}
        />
      </div>
    </div>
  );
};

export default LeaderboardPage;
