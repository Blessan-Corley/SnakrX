import { motion } from 'framer-motion';
import { FileText, Mail, Scale } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const TermsSupplementaryCards = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="mt-12 space-y-6"
    >
      <Card variant="glass" padding="lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Scale className="text-blue-400 mr-3" size={24} />
          Governing Law
        </h2>
        <div className="space-y-4">
          <p className="text-white/80 leading-relaxed">
            These terms are governed by applicable local law where the project is operated.
          </p>
          <p className="text-white/80 leading-relaxed">
            If there is a dispute, contact us first so we can try to resolve it quickly and fairly.
          </p>
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Mail className="text-green-400 mr-3" size={24} />
          Questions or Violations?
        </h2>
        <div className="space-y-4">
          <p className="text-white/80 leading-relaxed">
            If you have questions about these Terms or need to report a violation, please contact us:
          </p>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white font-medium">Email: snakrxgame@gmail.com</p>
            <p className="text-white/70 text-sm mt-1">
              We usually respond within 1-3 business days.
            </p>
          </div>
          <p className="text-white/70 text-sm">
            When reporting violations, please provide as much detail as possible including usernames,
            dates, and description of the incident.
          </p>
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FileText className="text-purple-400 mr-3" size={24} />
          Final Provisions
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Severability</h3>
            <p className="text-white/80 leading-relaxed">
              If any part of these Terms is found to be unenforceable, the remaining provisions will
              continue in full force and effect.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Entire Agreement</h3>
            <p className="text-white/80 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between
              you and SnakrX regarding the use of our service.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Waiver</h3>
            <p className="text-white/80 leading-relaxed">
              Our failure to enforce any provision of these Terms shall not constitute a waiver of that
              provision or any other provision.
            </p>
          </div>
        </div>
      </Card>

      <div className="text-center py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button variant="ghost-primary" onClick={() => onNavigate('/privacy')}>
            Privacy Policy
          </Button>
          <Button variant="ghost-primary" onClick={() => onNavigate('/support')}>
            Help & Support
          </Button>
          <Button variant="ghost-primary" onClick={() => onNavigate('/support')}>
            Contact Us
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsSupplementaryCards;
