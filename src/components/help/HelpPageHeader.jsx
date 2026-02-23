import { motion } from 'framer-motion';
import { HELP_PAGE_TITLE_ICON } from './helpData.js';

const HelpPageHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
      {HELP_PAGE_TITLE_ICON}
      Help & Support
    </h1>
    <p className="text-xl text-white/70 max-w-2xl mx-auto">
      Everything you need to know about SnakrX
    </p>
  </motion.div>
);

export default HelpPageHeader;
