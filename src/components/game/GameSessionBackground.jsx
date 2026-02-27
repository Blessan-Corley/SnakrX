import { motion } from 'framer-motion';

const GameSessionBackground = () => (
  <div className="absolute inset-0 z-0">
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
          'radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 60%)'
        ]
      }}
      transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
    />
  </div>
);

export default GameSessionBackground;
