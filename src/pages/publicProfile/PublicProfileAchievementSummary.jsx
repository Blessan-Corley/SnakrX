import Card from '@/components/ui/Card';
import { formatDateTime } from './publicProfileUtils.js';

const PublicProfileAchievementSummary = ({ stats, bestScoreDate }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <Card variant="glass" padding="md">
      <div className="space-y-1">
        <p className="text-white/60 text-sm">Achievements Completed</p>
        <p className="text-white text-xl font-bold">{stats.achievementsCompleted || 0}</p>
      </div>
    </Card>
    <Card variant="glass" padding="md">
      <div className="space-y-1">
        <p className="text-white/60 text-sm">Achievement Points</p>
        <p className="text-white text-xl font-bold">{stats.achievementPoints || 0}</p>
      </div>
    </Card>
    <Card variant="glass" padding="md">
      <div className="space-y-1">
        <p className="text-white/60 text-sm">Best Score Date</p>
        <p className="text-white text-sm font-semibold">{bestScoreDate ? formatDateTime(bestScoreDate) : 'Not set'}</p>
      </div>
    </Card>
  </div>
);

export default PublicProfileAchievementSummary;
