import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

const RegisterPageHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
      className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4"
    >
      <Gamepad2 size={32} />
    </motion.div>
    <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-2">
      Join SnakrX
    </h1>
    <p className="text-white/70">
      Create your account and start gaming
    </p>
  </motion.div>
);

export default RegisterPageHeader;
