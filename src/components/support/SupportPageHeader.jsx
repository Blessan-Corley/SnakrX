import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const SupportPageHeader = ({ onBack, HeaderIcon }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <div className="flex items-center justify-center mb-6">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={16} />}
        onClick={onBack}
      >
        Back
      </Button>
    </div>

    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
      <HeaderIcon className="inline mr-3 text-green-400" size={48} />
      Support Center
    </h1>
    <p className="text-xl text-white/70 max-w-2xl mx-auto">
      We are still early and improving. Send a message and we will help when we can.
    </p>
  </motion.div>
);

export default SupportPageHeader;
