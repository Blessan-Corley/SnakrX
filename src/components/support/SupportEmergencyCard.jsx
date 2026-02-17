import { motion } from 'framer-motion';
import { Mail, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const SupportEmergencyCard = ({ EmergencyIcon, onEmailContact, onWhatsAppContact }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.9 }}
    className="text-center"
  >
    <Card variant="glass" padding="lg" className="border-orange-500/30 bg-orange-500/10">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <EmergencyIcon className="text-orange-400" size={24} />
        <h3 className="text-xl font-semibold text-white">Urgent Technical Issues?</h3>
      </div>
      <p className="text-white/80 mb-4">
        If you&apos;re facing game-breaking bugs or account-security concerns, contact us by email first with steps to reproduce.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          variant="primary"
          onClick={() => onEmailContact('Urgent Technical Issue')}
          icon={<Mail size={18} />}
        >
          Email Support
        </Button>
        <Button
          variant="ghost"
          onClick={() => onWhatsAppContact('I need help with SnakrX.')}
          icon={<MessageSquare size={18} />}
        >
          WhatsApp Support
        </Button>
      </div>
    </Card>
  </motion.div>
);

export default SupportEmergencyCard;
