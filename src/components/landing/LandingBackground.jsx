import { motion } from 'framer-motion';

const LandingBackground = ({ mousePosition, y1 }) => {
  return (
    <div className="fixed inset-0 z-0">
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)`
        }}
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      />
    </div>
  );
};

export default LandingBackground;
