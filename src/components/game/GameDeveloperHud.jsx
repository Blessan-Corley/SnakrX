import { motion } from 'framer-motion';
import InputPerformanceMonitor from './InputPerformanceMonitor.jsx';

const GameDeveloperHud = ({ getInputPerformance, inputWarning, showPerformanceMonitor }) => (
  <>
    {import.meta.env.DEV && (
      <InputPerformanceMonitor
        getInputPerformance={getInputPerformance}
        isVisible={showPerformanceMonitor}
        position="top-left"
      />
    )}

    {inputWarning && (
      <motion.div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-semibold">
          Warning: {inputWarning}
        </div>
      </motion.div>
    )}
  </>
);

export default GameDeveloperHud;
