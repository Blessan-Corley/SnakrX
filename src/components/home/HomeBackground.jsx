import { motion } from 'framer-motion';

const HomeBackground = ({ mousePosition }) => (
  <div className="fixed inset-0 z-0">
    <motion.div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)`
      }}
    />
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
          'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
        ]
      }}
      transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
    />
  </div>
);

export default HomeBackground;
