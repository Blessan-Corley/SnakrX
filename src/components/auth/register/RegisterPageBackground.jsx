import { motion } from 'framer-motion';

const RegisterPageBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-dark opacity-90" />
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
          'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
          'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
        ]
      }}
      transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
    />
  </div>
);

export default RegisterPageBackground;
