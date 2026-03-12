import { motion } from 'framer-motion';

const PrivacyAnimatedBackground = () => (
  <div className="absolute inset-0 z-0">
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
          'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
        ]
      }}
      transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
    />
  </div>
);

export default PrivacyAnimatedBackground;
