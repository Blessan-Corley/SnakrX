import HomeFriendsSection from './actionPanels/HomeFriendsSection.jsx';
import HomeJourneySection from './actionPanels/HomeJourneySection.jsx';
import HomeQuickActionsSection from './actionPanels/HomeQuickActionsSection.jsx';
import HomeTopPlayersSection from './actionPanels/HomeTopPlayersSection.jsx';

const HomeActionPanels = ({
  isAdmin,
  lastPlayedSelection,
  loadingLeaderboard,
  recentLeaderboard,
  pendingRequests,
  outgoingRequests,
  friendSearch,
  searchResults,
  searching,
  userStats,
  memberSinceLabel,
  onPlayLastMode,
  onNavigate,
  onAcceptRequest,
  onCancelRequest,
  getRelationshipStatus,
  onRejectRequest,
  onFriendSearchChange,
  onFriendSearchSubmit,
  onSendRequest,
  onManageFriends,
}) => (
  <div className="lg:col-span-2 space-y-8">
    <HomeQuickActionsSection
      isAdmin={isAdmin}
      lastPlayedSelection={lastPlayedSelection}
      onNavigate={onNavigate}
      onPlayLastMode={onPlayLastMode}
    />

    <HomeTopPlayersSection
      loadingLeaderboard={loadingLeaderboard}
      onNavigate={onNavigate}
      recentLeaderboard={recentLeaderboard}
    />

    <HomeFriendsSection
      friendSearch={friendSearch}
      getRelationshipStatus={getRelationshipStatus}
      onAcceptRequest={onAcceptRequest}
      onCancelRequest={onCancelRequest}
      onFriendSearchChange={onFriendSearchChange}
      onFriendSearchSubmit={onFriendSearchSubmit}
      onManageFriends={onManageFriends}
      onRejectRequest={onRejectRequest}
      onSendRequest={onSendRequest}
      outgoingRequests={outgoingRequests}
      pendingRequests={pendingRequests}
      searchResults={searchResults}
      searching={searching}
    />

    <HomeJourneySection
      memberSinceLabel={memberSinceLabel}
      userStats={userStats}
    />
  </div>
);

export default HomeActionPanels;
