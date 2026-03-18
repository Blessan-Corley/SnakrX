import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SnakrXLogo from '@/components/ui/SnakrXLogo.jsx';

const LandingFooter = ({ onAction }) => {
  return (
    <motion.footer className="relative z-10 border-t border-white/10 bg-black/20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <SnakrXLogo
            className="mb-4 md:mb-0"
            size="sm"
            subtitle="Modern Snake Gaming"
          />

          <div className="flex items-center space-x-6 text-sm text-white/70">
            <Link to="/privacy" className="hover:text-white transition-colors" onClick={onAction}>
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors" onClick={onAction}>
              Terms
            </Link>
            <Link to="/support" className="hover:text-white transition-colors" onClick={onAction}>
              Support
            </Link>
            <a
              href="mailto:snakrxgame@gmail.com"
              className="hover:text-white transition-colors"
              onClick={onAction}
            >
              Contact: snakrxgame@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-6 text-center">
          <p className="text-white/50 text-sm">
            (c) 2026 SnakrX. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default LandingFooter;
