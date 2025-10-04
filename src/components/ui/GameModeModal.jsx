import { motion } from 'framer-motion';

const GameModeModal = ({ onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Snake Game</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              console.log('Classic mode selected');
              onSelect('classic');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Start Game
            <p className="text-sm font-normal mt-1">Use WASD or Arrow keys to control</p>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 text-gray-400 hover:text-white transition-colors"
        >
          Back to Menu
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GameModeModal;