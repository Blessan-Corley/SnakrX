import { motion } from 'framer-motion';
import { AlertTriangle, Mail } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';

const PrivacyFooterCards = ({
  onNavigate,
  policyUpdateSteps
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
    className="mt-12 space-y-6"
  >
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Mail className="text-green-400 mr-3" size={24} />
        Contact Us
      </h2>
      <div className="space-y-4">
        <p className="text-white/80 leading-relaxed">
          Questions about privacy or your data? Contact us at:
        </p>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white font-medium">Email: snakrxgame@gmail.com</p>
          <p className="text-white/70 text-sm mt-1">
            We usually respond within a few business days.
          </p>
        </div>
      </div>
    </Card>

    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <AlertTriangle className="text-amber-400 mr-3" size={24} />
        Policy Updates
      </h2>
      <div className="space-y-4">
        <p className="text-white/80 leading-relaxed">
          We may update this policy as features change. For major updates, we will:
        </p>
        <ul className="text-white/80 space-y-2 ml-6">
          {policyUpdateSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <p className="text-white/80 leading-relaxed">
          Continuing to use SnakrX after changes means you accept the updated policy.
        </p>
      </div>
    </Card>

    <div className="text-center py-6">
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Button variant="ghost-primary" onClick={() => onNavigate('/terms')}>
          Terms of Service
        </Button>
        <Button variant="ghost-primary" onClick={() => onNavigate('/support')}>
          Help &amp; Support
        </Button>
        <Button variant="ghost-primary" onClick={() => onNavigate('/support')}>
          Contact Us
        </Button>
      </div>
    </div>
  </motion.div>
);

export default PrivacyFooterCards;
