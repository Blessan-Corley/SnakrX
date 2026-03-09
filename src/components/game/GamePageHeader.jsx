import { motion } from 'framer-motion';

const GamePageHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-12"
  >
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
      Choose Your <span className="bg-gradient-sunset bg-clip-text text-transparent">Game Mode</span>
    </h1>
    <p className="text-xl text-white/70 max-w-2xl mx-auto">
      Select your preferred way to play and dive into the action
    </p>
  </motion.div>
);

export default GamePageHeader;
