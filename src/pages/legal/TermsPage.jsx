import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle,
  Crown,
  FileText,
  Gamepad2,
  Info,
  Scale,
  Shield,
  User
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PublicPageLayout from '@/components/layout/PublicPageLayout.jsx';
import { playClick } from '@/utils/sound';
import TermsSectionsList from './terms/TermsSectionsList.jsx';
import TermsSupplementaryCards from './terms/TermsSupplementaryCards.jsx';
import {
  TERMS_LAST_UPDATED,
  TERMS_OVERVIEW_ITEMS,
  TERMS_SECTIONS
} from './terms/termsContent.js';

const SECTION_ICONS = {
  AlertTriangle,
  Ban,
  CheckCircle,
  Crown,
  FileText,
  Gamepad2,
  Shield,
  User
};

const TermsPage = () => {
  const handleNavigate = (path) => {
    playClick();
    window.location.href = path;
  };

  return (
    <PublicPageLayout
      maxWidth="max-w-4xl"
      background={(
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    >
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
            onClick={() => handleNavigate('/')}
          >
            Back to Game
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Scale className="inline mr-3 text-orange-400" size={48} />
            Terms of Service
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            SnakrX is an early-stage project. These terms are here to keep the game fair, safe,
            and clear for everyone.
          </p>
          <div className="mt-4 text-white/50 text-sm">
            Last updated: {TERMS_LAST_UPDATED}
          </div>
        </div>
      </motion.div>

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
              <h2 className="text-xl font-bold text-white mb-3">Quick Overview</h2>
              <div className="text-white/90 space-y-2">
                {TERMS_OVERVIEW_ITEMS.map((item) => (
                  <p key={item}> {item}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <TermsSectionsList sections={TERMS_SECTIONS} iconMap={SECTION_ICONS} />
      <TermsSupplementaryCards onNavigate={handleNavigate} />
    </PublicPageLayout>
  );
};

export default TermsPage;
