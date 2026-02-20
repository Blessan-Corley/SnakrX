import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PublicProfileAchievementSummary from './publicProfile/PublicProfileAchievementSummary.jsx';
import PublicProfileCoreStats from './publicProfile/PublicProfileCoreStats.jsx';
import PublicProfileHeroCard from './publicProfile/PublicProfileHeroCard.jsx';
import PublicProfileMembershipPanels from './publicProfile/PublicProfileMembershipPanels.jsx';
import PublicProfileNotFound from './publicProfile/PublicProfileNotFound.jsx';
import PublicProfileRecentMatches from './publicProfile/PublicProfileRecentMatches.jsx';
import { usePublicProfileController } from './publicProfile/usePublicProfileController.js';

const PublicProfilePage = () => {
  const navigate = useNavigate();
  const {
    profile,
    history,
    loading,
    relationshipLoading,
    isOwnProfile,
    friendAction,
    stats,
    mostPlayedMode,
    xpProgress,
    createdAtDate,
    lastActiveDate,
    bestScoreDate,
    membershipSummary,
    handleSendInvite
  } = usePublicProfileController();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  if (!profile) {
    return <PublicProfileNotFound onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />} className="mb-6">
          Back
        </Button>

        <PublicProfileHeroCard
          profile={profile}
          isOwnProfile={isOwnProfile}
          friendAction={friendAction}
          relationshipLoading={relationshipLoading}
          onSendInvite={handleSendInvite}
        />
        <PublicProfileCoreStats stats={stats} />
        <PublicProfileMembershipPanels
          createdAtDate={createdAtDate}
          membershipSummary={membershipSummary}
          lastActiveDate={lastActiveDate}
          xpProgress={xpProgress}
          mostPlayedMode={mostPlayedMode}
        />
        <PublicProfileAchievementSummary stats={stats} bestScoreDate={bestScoreDate} />
        <PublicProfileRecentMatches history={history} />
      </div>
    </div>
  );
};

export default PublicProfilePage;
