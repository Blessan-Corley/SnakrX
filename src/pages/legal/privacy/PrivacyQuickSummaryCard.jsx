import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import Card from '@/components/ui/Card.jsx';

const PrivacyQuickSummaryCard = ({ points }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mb-8"
  >
    <Card variant="gradient" padding="lg">
      <div className="flex items-start space-x-4">
        <Info className="text-white mt-1" size={24} />
        <div>
          <h2 className="text-xl font-bold text-white mb-3">Quick Summary</h2>
          <div className="text-white/90 space-y-2">
            {points.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default PrivacyQuickSummaryCard;
