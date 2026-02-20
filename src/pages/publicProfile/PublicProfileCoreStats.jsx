import { Gamepad2, Trophy, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatScore, formatTime } from '@/utils/gameUtils';

const PublicProfileCoreStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">Total Score</p>
          <p className="text-white text-xl font-bold">{formatScore(stats.totalScore || 0)}</p>
        </div>
        <Trophy size={20} className="text-amber-300" />
      </div>
    </Card>
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">Play Time</p>
          <p className="text-white text-xl font-bold">{formatTime(stats.totalPlayTime || 0)}</p>
        </div>
        <Gamepad2 size={20} className="text-blue-300" />
      </div>
    </Card>
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">Multiplayer Wins</p>
          <p className="text-white text-xl font-bold">{stats.multiplayerWins || 0}</p>
        </div>
        <Users size={20} className="text-purple-300" />
      </div>
    </Card>
  </div>
);

export default PublicProfileCoreStats;
