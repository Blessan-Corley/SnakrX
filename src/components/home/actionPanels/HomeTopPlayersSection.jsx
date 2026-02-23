import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card, { LeaderboardCard } from '@/components/ui/Card.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';

const HomeTopPlayersSection = ({
  loadingLeaderboard,
  onNavigate,
  recentLeaderboard
}) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <Crown className="mr-2" size={20} />
      Top Players
    </h3>
    <div className="space-y-3">
      {loadingLeaderboard ? (
        <Card variant="glass" padding="lg">
          <div className="text-center py-8">
            <LoadingSpinner size="sm" />
            <p className="text-white/70 text-sm mt-2">Loading leaderboard...</p>
          </div>
        </Card>
      ) : recentLeaderboard.length > 0 ? (
        recentLeaderboard.map((entry, index) => (
          <motion.div
            key={`${entry.rank}-${entry.player}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LeaderboardCard {...entry} />
          </motion.div>
        ))
      ) : (
        <Card variant="glass" padding="lg">
          <div className="text-center py-8">
            <div className="flex items-center justify-center text-4xl mb-3 text-amber-300">
              <Trophy size={32} />
            </div>
            <p className="text-white/70">No leaderboard data yet!</p>
            <p className="text-white/50 text-sm mt-1">Be the first to set a record</p>
          </div>
        </Card>
      )}
    </div>
    <Link to="/leaderboard" className="block mt-4">
      <Button variant="ghost" fullWidth onClick={() => onNavigate('/leaderboard')}>
        View Full Leaderboard
      </Button>
    </Link>
  </div>
);

export default HomeTopPlayersSection;
