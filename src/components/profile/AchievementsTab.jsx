import Card from '@/components/ui/Card';
import { getIconComponent } from '@/utils/iconMap';

/**
 * Profile Achievements Tab Component
 */
export const AchievementsTab = ({ achievementStats }) => {
  const categoryInfo = {
    gameplay: { name: 'Gameplay', icon: 'gamepad', color: 'text-orange-400' },
    score: { name: 'High Scores', icon: 'trophy', color: 'text-yellow-400' },
    survival: { name: 'Survival', icon: 'clock', color: 'text-green-400' },
    speed: { name: 'Speed', icon: 'zap', color: 'text-blue-400' },
    funny: { name: 'Oops!', icon: 'alert', color: 'text-red-400' },
    vsai: { name: 'AI Destroyer', icon: 'cpu', color: 'text-purple-400' },
    multiplayer: { name: 'Social', icon: 'users', color: 'text-cyan-400' },
    special: { name: 'Special', icon: 'sparkles', color: 'text-pink-400' }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Achievements</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-400">
            {achievementStats.unlocked}/{achievementStats.total}
          </div>
          <div className="text-white/60 text-sm">Unlocked</div>
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(achievementStats.byCategory).map(([category, stats]) => {
          const info = categoryInfo[category] || { name: category, icon: 'award', color: 'text-white' };
          const Icon = getIconComponent(info.icon);

          return (
            <Card key={category} variant="glass" padding="md">
              <div className="text-center">
                <div className="flex items-center justify-center text-3xl mb-2 text-white">
                  <Icon size={28} />
                </div>
                <h3 className={`font-semibold ${info.color} mb-2`}>
                  {info.name}
                </h3>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.unlocked}/{stats.total}
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-sunset h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <div className="text-white/60 text-sm">
                  {stats.percentage}% complete
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
