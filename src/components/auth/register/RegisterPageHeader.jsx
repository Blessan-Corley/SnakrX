import { motion } from 'framer-motion';
import SnakrXLogo from '@/components/ui/SnakrXLogo.jsx';

const RegisterPageHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <div className="flex justify-center mb-4">
      <SnakrXLogo
        size="lg"
        showSubtitle={false}
        rotateOnHover
      />
    </div>
    <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-2">
      Join SnakrX
    </h1>
    <p className="text-white/70">
      Create your account and start gaming
    </p>
  </motion.div>
);

export default RegisterPageHeader;
