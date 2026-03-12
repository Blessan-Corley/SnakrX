import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const LeaderboardPageHeader = ({ isWeeklyMode, activeWeekKey }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
      <Trophy className="inline mr-3" size={48} /> Leaderboards
    </h1>
    <p className="text-xl text-white/70">See how you stack up against the best players.</p>
    {isWeeklyMode && activeWeekKey && (
      <p className="text-sm text-white/60 mt-2">Weekly snapshot: {activeWeekKey}</p>
    )}
  </motion.div>
);

export default LeaderboardPageHeader;
