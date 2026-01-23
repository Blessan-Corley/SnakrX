import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { playClick } from '@/utils/sound';

/**
 * Admin Password Authentication Component
 */
export const AdminAuth = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'SnakrX_Admin_2024!';

  const handlePasswordSubmit = (e) => {
    if (e) e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onAuthenticate(true);
      setError('');
      playClick();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card variant="glass" padding="lg">
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🛡️
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-white/70">Enter password to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit(e)}
                placeholder="Enter admin password"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              variant="primary"
              fullWidth
              icon={<Shield size={18} />}
              disabled={!password}
              onClick={handlePasswordSubmit}
            >
              Access Admin Panel
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
