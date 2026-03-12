import { motion } from 'framer-motion';
import { Crown, Target, Users } from 'lucide-react';
import { formatScore } from '../../utils/gameUtils.js';
import { StatsCard } from '../../components/ui/Card.jsx';

const LeaderboardStatsSection = ({ stats, isAchievementMode, isWeeklyMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
  >
    <StatsCard title="Ranked Players" value={stats.totalPlayers} icon={<Users size={20} />} subtitle="Who have played" />
    <StatsCard
      title={isAchievementMode ? 'Top Points' : 'Top Score'}
      value={formatScore(stats.topScore)}
      icon={<Crown size={20} />}
      subtitle={isAchievementMode ? 'Achievement ranking' : isWeeklyMode ? 'Best of last completed week' : 'All Time High'}
    />
    <StatsCard
      title="Your Rank"
      value={stats.yourRank ? `#${stats.yourRank}` : 'N/A'}
      icon={<Target size={20} />}
      subtitle={stats.yourRank ? 'In current filter' : 'Play to get ranked!'}
    />
  </motion.div>
);

export default LeaderboardStatsSection;
