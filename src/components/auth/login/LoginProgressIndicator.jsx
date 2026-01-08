import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const LoginProgressIndicator = ({ currentStep }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="flex items-center justify-center mb-8"
  >
    <div className="flex items-center space-x-4">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
      `}>
        {currentStep > 1 ? <CheckCircle size={16} /> : '1'}
      </div>
      <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? 'bg-primary-500' : 'bg-white/10'}`} />
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
      `}>
        2
      </div>
    </div>
  </motion.div>
);

export default LoginProgressIndicator;
