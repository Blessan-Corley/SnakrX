import { AnimatePresence, motion } from 'framer-motion';
import AccountHelpSection from './sections/AccountHelpSection.jsx';
import AchievementsHelpSection from './sections/AchievementsHelpSection.jsx';
import ControlsHelpSection from './sections/ControlsHelpSection.jsx';
import GameModesHelpSection from './sections/GameModesHelpSection.jsx';
import GettingStartedHelpSection from './sections/GettingStartedHelpSection.jsx';
import TroubleshootingHelpSection from './sections/TroubleshootingHelpSection.jsx';

const HelpSectionContent = ({ activeSection, mobile }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={activeSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {activeSection === 'getting-started' && <GettingStartedHelpSection />}
      {activeSection === 'game-modes' && <GameModesHelpSection mobile={mobile} />}
      {activeSection === 'controls' && <ControlsHelpSection mobile={mobile} />}
      {activeSection === 'achievements' && <AchievementsHelpSection />}
      {activeSection === 'account' && <AccountHelpSection />}
      {activeSection === 'troubleshooting' && <TroubleshootingHelpSection />}
    </motion.div>
  </AnimatePresence>
);

export default HelpSectionContent;
