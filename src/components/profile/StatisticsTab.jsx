import { Trophy, Crown, Target, Medal, Zap, Gamepad2 } from 'lucide-react';
import Card, { StatsCard } from '@/components/ui/Card';
import { formatScore, formatTime } from '@/utils/gameUtils';

/**
 * Profile Statistics Tab Component
 */
export const StatisticsTab = ({ userStats }) => {
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
          value={`${userStats.totalGames > 0 ? Math.round((userStats.totalWins || 0) / userStats.totalGames * 100) : 0}%`}
          icon={<Medal size={20} />}
          trend={userStats.totalWins > userStats.totalGames * 0.5 ? 8 : 0}
          subtitle="Success rate"
        />
      </div>

      {/* Game Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <span className="text-white/70">Games Won:</span>
              <span className="text-white font-medium">{userStats.classicWins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best Score:</span>
              <span className="text-white font-medium">{formatScore(userStats.classicBestScore || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Win Rate:</span>
              <span className="text-white font-medium">
                {userStats.classicGames > 0 ? Math.round((userStats.classicWins || 0) / userStats.classicGames * 100) : 0}%
              </span>
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
              <span className="text-white font-medium">{userStats.vsAIGames || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Games Won:</span>
              <span className="text-white font-medium">{userStats.vsAIWins || 0}</span>
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
              <span className="text-white font-medium">{formatTime(Math.floor((userStats.totalPlayTime || 0) / 60))}</span>
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
          </div>
        </Card>
      </div>
    </div>
  );
};
