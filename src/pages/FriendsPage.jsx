import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { FriendsTab } from '@/components/profile';

const FriendsPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Users size={28} className="text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Friends</h1>
        </div>

        <FriendsTab />
      </div>
    </div>
  );
};

export default FriendsPage;

