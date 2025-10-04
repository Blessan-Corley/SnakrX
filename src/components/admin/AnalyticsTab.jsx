import Card from '@/components/ui/Card';
import { formatScore } from '@/utils/gameUtils';

/**
 * Admin Analytics Tab Component
 */
export const AnalyticsTab = ({ stats }) => {
  return (
    <div className="space-y-6">
      <Card variant="glass" padding="lg">
        <h2 className="text-xl font-bold text-white mb-6">System Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">User Activity</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">New users today:</span>
                <span className="text-white">{stats.newUsersToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Daily active:</span>
                <span className="text-white">{stats.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Weekly active:</span>
                <span className="text-white">{stats.weeklyActiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Retention rate:</span>
                <span className="text-white">{stats.retentionRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Game Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Total games:</span>
                <span className="text-white">{formatScore(stats.totalGames || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Total score:</span>
                <span className="text-white">{formatScore(stats.totalScore || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Avg score:</span>
                <span className="text-white">{formatScore(stats.averageScore || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Total achievements:</span>
                <span className="text-white">{stats.totalAchievements || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">System Health</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Active users:</span>
                <span className="text-green-400">{stats.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Banned users:</span>
                <span className="text-red-400">{stats.bannedUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Server status:</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Last updated:</span>
                <span className="text-white">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
