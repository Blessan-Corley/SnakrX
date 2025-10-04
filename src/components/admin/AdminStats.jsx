import { motion } from 'framer-motion';
import { Users, CheckCircle, Ban, Gamepad2 } from 'lucide-react';
import Card from '@/components/ui/Card';

/**
 * Admin Statistics Overview Component
 */
export const AdminStats = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      <Card variant="glass" padding="md">
        <div className="text-center">
          <Users className="mx-auto mb-2 text-blue-400" size={24} />
          <div className="text-2xl font-bold text-white">{stats.totalUsers || 0}</div>
          <div className="text-white/60 text-sm">Total Users</div>
        </div>
      </Card>

      <Card variant="glass" padding="md">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
          <div className="text-2xl font-bold text-white">{stats.activeUsers || 0}</div>
          <div className="text-white/60 text-sm">Active Users</div>
        </div>
      </Card>

      <Card variant="glass" padding="md">
        <div className="text-center">
          <Ban className="mx-auto mb-2 text-red-400" size={24} />
          <div className="text-2xl font-bold text-white">{stats.bannedUsers || 0}</div>
          <div className="text-white/60 text-sm">Banned Users</div>
        </div>
      </Card>

      <Card variant="glass" padding="md">
        <div className="text-center">
          <Gamepad2 className="mx-auto mb-2 text-purple-400" size={24} />
          <div className="text-2xl font-bold text-white">{stats.totalGames || 0}</div>
          <div className="text-white/60 text-sm">Total Games</div>
        </div>
      </Card>
    </motion.div>
  );
};
