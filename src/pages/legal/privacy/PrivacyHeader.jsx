import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';

const PrivacyHeader = ({
  lastUpdated,
  onBack
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8"
  >
    <div className="flex items-center mb-6">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={16} />}
        onClick={onBack}
      >
        Back to Game
      </Button>
    </div>

    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        <Shield className="inline mr-3 text-blue-400" size={48} />
        Privacy Policy
      </h1>
      <p className="text-xl text-white/70 max-w-2xl mx-auto">
        SnakrX is a small, growing project. This page explains what data we use today and how we handle it.
      </p>
      <div className="mt-4 text-white/50 text-sm">
        Last updated: {lastUpdated}
      </div>
    </div>
  </motion.div>
);

export default PrivacyHeader;
