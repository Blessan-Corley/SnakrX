import { Trophy, Star, Gamepad2, TrendingUp } from 'lucide-react';
import Card, { StatsCard } from '@/components/ui/Card';
import { formatScore, formatTime } from '@/utils/gameUtils';
import { getMostPlayedMode } from '@/utils/gamePreferences';

/**
 * Profile Overview Tab Component
 */
export const OverviewTab = ({ userStats, achievementStats, totalAchievementPoints, mockMatchHistory }) => {
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
  const bestGameMode = modeLabelMap[userStats.bestScoreMode] || null;
  const bestScoreDate = (() => {
    const value = userStats.bestScoreAt;
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
    if (typeof value === 'number' || typeof value === 'string') return new Date(value);
    return null;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Stats Overview */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-white">Gaming Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Score"
            value={formatScore(userStats.totalScore || 0)}
            icon={<Trophy size={20} />}
            subtitle="All time"
          />
          <StatsCard
            title="Best Game"
            value={formatScore(userStats.bestScore || 0)}
            icon={<Star size={20} />}
            subtitle={bestScoreDate ? `${bestGameMode || 'Best run'} - ${bestScoreDate.toLocaleDateString()} ${bestScoreDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Personal record'}
          />
          <StatsCard
            title="Games Played"
            value={userStats.totalGames || 0}
            icon={<Gamepad2 size={20} />}
            subtitle="Total matches"
          />
          <StatsCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={<TrendingUp size={20} />}
            subtitle="Competitive modes"
          />
        </div>

        {/* Recent Activity */}
        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {mockMatchHistory.slice(0, 3).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium text-white">{match.mode}</div>
                  <div className="text-sm text-white/60">
                    {formatScore(match.score)} - {formatTime(match.time)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    match.result === 'victory' ? 'text-green-400' :
                    match.result === 'defeat' ? 'text-red-400' :
                    'text-white'
                  }`}>
                    {match.result === 'victory' ? 'Victory' :
                     match.result === 'defeat' ? 'Defeat' :
                     'Completed'}
                  </div>
                  <div className="text-xs text-white/60">
                    {match.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Achievements & Quick Stats */}
      <div className="space-y-6">
        {/* Achievement Summary */}
        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white mb-1">
              {achievementStats.unlocked}
            </div>
            <div className="text-white/60">
              of {achievementStats.total} unlocked
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-sunset h-2 rounded-full transition-all duration-500"
                style={{ width: `${achievementStats.completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-primary-400 font-bold">
              {totalAchievementPoints} points
            </div>
            <div className="text-white/60 text-sm">earned</div>
          </div>
        </Card>

        {/* Quick Game Stats */}
        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4">Game Modes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-white/70">Most Played</span>
              <span className="text-primary-300 font-semibold">
                {mostPlayedMode.label} ({mostPlayedMode.count})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Classic</span>
              <span className="text-white font-medium">{userStats.classicGames || 0} games</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Transparent</span>
              <span className="text-white font-medium">{userStats.transparentGames || 0} games</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">VS AI</span>
              <span className="text-white font-medium">{userStats.vsaiGames || 0} games</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Multiplayer</span>
              <span className="text-white font-medium">{userStats.multiplayerGames || 0} games</span>
            </div>
          </div>
        </Card>

        {/* Fun Stats */}
        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4">Fun Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Food Eaten:</span>
              <span className="text-white">{userStats.foodEaten || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Wall Hits:</span>
              <span className="text-white">{userStats.wallHits || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Max Speed:</span>
              <span className="text-white">{(userStats.maxSpeed || 1).toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Play Time:</span>
              <span className="text-white">{formatTime(userStats.totalPlayTime || 0)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
