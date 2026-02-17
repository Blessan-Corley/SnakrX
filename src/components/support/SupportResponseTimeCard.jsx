import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const SupportResponseTimeCard = ({ leftIcon: LeftIcon, rightIcon: RightIcon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mb-8"
  >
    <Card variant="gradient" padding="lg">
      <div className="flex items-center justify-center space-x-4">
        <LeftIcon className="text-white" size={32} />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Response Time</h2>
          <p className="text-white/90">
            We usually reply within 24 hours on weekdays. Some issues can take longer while we investigate.
          </p>
        </div>
        <RightIcon className="text-white" size={32} />
      </div>
    </Card>
  </motion.div>
);

export default SupportResponseTimeCard;
