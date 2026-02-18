import { AnimatePresence, motion } from 'framer-motion';
import { Monitor } from 'lucide-react';
import Button from '@/components/ui/Button';

const GameMobileWarningModal = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-card backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="text-center">
            <div className="flex items-center justify-center text-4xl mb-4 text-white">
              <Monitor size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Desktop Experience Required</h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              Multiplayer mode requires a desktop or laptop for the best experience with multiple players and proper controls.
            </p>
            <Button
              variant="primary"
              onClick={onClose}
              fullWidth
            >
              Got it!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default GameMobileWarningModal;
