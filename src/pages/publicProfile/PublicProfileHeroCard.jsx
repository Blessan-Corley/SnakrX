import { UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatScore } from '@/utils/gameUtils';

const PublicProfileHeroCard = ({
  profile,
  isOwnProfile,
  friendAction,
  relationshipLoading,
  onSendInvite
}) => (
  <Card variant="glass" padding="lg" className="mb-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-center space-x-4">
        <UserAvatar profile={profile} size="lg" enablePreview className="border border-white/20" />
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.displayName || 'Player'}</h1>
          <p className="text-white/60 text-sm">@{profile.username || 'unknown'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-white">{profile?.stats?.totalGames || 0}</div>
          <div className="text-xs text-white/60">Games</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-white">{formatScore(profile?.stats?.bestScore || 0)}</div>
          <div className="text-xs text-white/60">Best Score</div>
        </div>
      </div>
    </div>
    {!isOwnProfile && (
      <div className="mt-4 md:mt-0">
        {friendAction && (
          <Button
            variant={friendAction.variant}
            icon={<UserPlus size={16} />}
            onClick={onSendInvite}
            loading={relationshipLoading}
            disabled={friendAction.disabled || relationshipLoading}
          >
            {friendAction.label}
          </Button>
        )}
      </div>
    )}
  </Card>
);

export default PublicProfileHeroCard;
