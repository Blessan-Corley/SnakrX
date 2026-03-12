import { motion } from 'framer-motion';
import HomeAchievementsPanel from '@/components/home/HomeAchievementsPanel.jsx';
import HomeActionPanels from '@/components/home/HomeActionPanels.jsx';
import HomeBackground from '@/components/home/HomeBackground.jsx';
import HomeFirstGameCta from '@/components/home/HomeFirstGameCta.jsx';
import HomeGameModesSection from '@/components/home/HomeGameModesSection.jsx';
import HomeHeroSection from '@/components/home/HomeHeroSection.jsx';
import { playClick } from '@/utils/sound';
import useHomePageController from './home/useHomePageController.js';

/**
 * Home Page - Main Dashboard
 * Features welcome message, game modes, stats, and recent activity
 */
const HomePage = () => {
  const {
    acceptRequest,
    cancelRequest,
    friendSearch,
    getRelationshipStatus,
    handleFriendSearch,
    handleGameMode,
    handleManageFriends,
    handleNavigate,
    handleOpenHelp,
    handlePlayLastMode,
    isAdmin,
    lastPlayedSelection,
    loadingLeaderboard,
    markTypingComplete,
    memberSinceLabel,
    mobile,
    mousePosition,
    nextAchievements,
    outgoingRequests,
    pendingRequests,
    quickStats,
    recentLeaderboard,
    recentUnlocks,
    rejectRequest,
    searchResults,
    searching,
    sendRequest,
    setFriendSearch,
    showGameModes,
    totalGames,
    typingComplete,
    userDisplayName,
    userStats
  } = useHomePageController();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <HomeBackground mousePosition={mousePosition} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <HomeHeroSection
          typingComplete={typingComplete}
          userDisplayName={userDisplayName}
          quickStats={quickStats}
          onTypingComplete={markTypingComplete}
        />

        <HomeGameModesSection
          showGameModes={showGameModes}
          lastPlayedSelection={lastPlayedSelection}
          mobile={mobile}
          onOpenHelp={handleOpenHelp}
          onPlayLastMode={handlePlayLastMode}
          onSelectMode={handleGameMode}
        />

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: showGameModes ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <HomeAchievementsPanel
            nextAchievements={nextAchievements}
            recentUnlocks={recentUnlocks}
            userStats={userStats}
            onViewAchievements={playClick}
          />

          <HomeActionPanels
            isAdmin={isAdmin}
            lastPlayedSelection={lastPlayedSelection}
            loadingLeaderboard={loadingLeaderboard}
            recentLeaderboard={recentLeaderboard}
            pendingRequests={pendingRequests}
            outgoingRequests={outgoingRequests}
            friendSearch={friendSearch}
            searchResults={searchResults}
            searching={searching}
            userStats={userStats}
            memberSinceLabel={memberSinceLabel}
            onPlayLastMode={handlePlayLastMode}
            onNavigate={handleNavigate}
            onAcceptRequest={acceptRequest}
            onCancelRequest={cancelRequest}
            getRelationshipStatus={getRelationshipStatus}
            onRejectRequest={rejectRequest}
            onFriendSearchChange={setFriendSearch}
            onFriendSearchSubmit={handleFriendSearch}
            onSendRequest={sendRequest}
            onManageFriends={handleManageFriends}
          />
        </motion.section>

        <HomeFirstGameCta
          totalGames={totalGames}
          lastPlayedSelection={lastPlayedSelection}
          onPlay={() => {
            if (lastPlayedSelection) {
              handlePlayLastMode();
              return;
            }
            handleGameMode('classic');
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;
