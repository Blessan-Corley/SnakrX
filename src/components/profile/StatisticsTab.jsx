import { Trophy, Crown, Target, Medal, Zap, Gamepad2, Monitor } from 'lucide-react';
import Card, { StatsCard } from '@/components/ui/Card';
import { formatScore, formatTime } from '@/utils/gameUtils';
import { getMostPlayedMode } from '@/utils/gamePreferences';

/**
 * Profile Statistics Tab Component
 */
export const StatisticsTab = ({ userStats }) => {
  const mostPlayedMode = getMostPlayedMode(userStats);
  const competitiveGames =
    Number(userStats.competitiveGames) ||
    (Number(userStats.vsaiGames) || 0) + (Number(userStats.multiplayerGames) || 0);
  const competitiveWins = Number(userStats.competitiveWins) || Number(userStats.totalWins) || 0;
  const winRate = competitiveGames > 0 ? Math.round((competitiveWins / competitiveGames) * 100) : 0;
  const modeLabelMap = {
    classic: 'Classic',
    classic_transparent: 'Transparent',
    vsai: 'VS AI',
    multiplayer: 'Multiplayer'
  };
  const formatDateLabel = (value) => {
    if (!value) return 'N/A';
    let date = null;
    if (typeof value?.toDate === 'function') date = value.toDate();
    else if (typeof value?.seconds === 'number') date = new Date(value.seconds * 1000);
    else if (typeof value === 'number' || typeof value === 'string') date = new Date(value);
    if (!date || Number.isNaN(date.getTime())) return 'N/A';
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Detailed Statistics</h2>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Score"
          value={formatScore(userStats.totalScore || 0)}
          icon={<Trophy size={20} />}
          trend={userStats.totalScore > 1000 ? 15 : 0}
          subtitle="All time points"
        />
        <StatsCard
          title="Best Score"
          value={formatScore(userStats.bestScore || 0)}
          icon={<Crown size={20} />}
          subtitle="Personal record"
        />
        <StatsCard
          title="Average Score"
          value={formatScore(userStats.totalGames > 0 ? Math.round((userStats.totalScore || 0) / userStats.totalGames) : 0)}
          icon={<Target size={20} />}
          subtitle="Per game"
        />
        <StatsCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={<Medal size={20} />}
          trend={competitiveWins > competitiveGames * 0.5 ? 8 : 0}
          subtitle="Competitive modes"
        />
      </div>

      {/* Game Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 text-green-400" size={20} />
            Classic Mode
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Games Played:</span>
              <span className="text-white font-medium">{userStats.classicGames || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Sessions:</span>
              <span className="text-white font-medium">{userStats.classicGames || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best Score:</span>
              <span className="text-white font-medium">{formatScore(userStats.classicBestScore || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Mode Type:</span>
              <span className="text-white font-medium">Completion</span>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Monitor className="mr-2 text-sky-400" size={20} />
            Transparent Mode
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Games Played:</span>
              <span className="text-white font-medium">{userStats.transparentGames || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Sessions:</span>
              <span className="text-white font-medium">{userStats.transparentGames || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best Score:</span>
              <span className="text-white font-medium">{formatScore(userStats.transparentBestScore || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Mode Type:</span>
              <span className="text-white font-medium">Completion</span>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="mr-2 text-blue-400" size={20} />
            VS AI Mode
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Games Played:</span>
              <span className="text-white font-medium">{userStats.vsaiGames || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Games Won:</span>
              <span className="text-white font-medium">{userStats.vsaiWins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Easy Wins:</span>
              <span className="text-white font-medium">{userStats.aiEasyWins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Impossible Wins:</span>
              <span className="text-white font-medium">{userStats.aiImpossibleWins || 0}</span>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Gamepad2 className="mr-2 text-purple-400" size={20} />
            General Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Play Time:</span>
              <span className="text-white font-medium">{formatTime(userStats.totalPlayTime || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Food Eaten:</span>
              <span className="text-white font-medium">{userStats.foodEaten || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best Streak:</span>
              <span className="text-white font-medium">{userStats.bestWinStreak || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Max Speed:</span>
              <span className="text-white font-medium">{(userStats.maxSpeed || 1).toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Most Played:</span>
              <span className="text-white font-medium">{mostPlayedMode.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best Game At:</span>
              <span className="text-white font-medium">{formatDateLabel(userStats.bestScoreAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best Game Mode:</span>
              <span className="text-white font-medium">{modeLabelMap[userStats.bestScoreMode] || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Last Game At:</span>
              <span className="text-white font-medium">{formatDateLabel(userStats.lastGameAt)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
