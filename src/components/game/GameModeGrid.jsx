import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatScore } from '@/utils/gameUtils';

const GameModeGrid = ({ gameModes, itemVariants, onModeSelect, onConfigureMode }) => (
  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {gameModes.map((mode) => {
      const Icon = mode.Icon;

      return (
        <motion.div
          key={mode.id}
          variants={itemVariants}
          whileHover={{ scale: mode.disabled ? 1 : 1.02 }}
          whileTap={{ scale: mode.disabled ? 1 : 0.98 }}
        >
          <Card
            variant="glass"
            clickable={!mode.disabled}
            interactiveElement="div"
            onClick={() => onModeSelect(mode)}
            className={`h-full transition-all duration-300 ${
              mode.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-glow cursor-pointer'
            }`}
          >
            <div className="text-center p-6">
              <div className="flex items-center justify-center text-white mb-4">
                <Icon size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{mode.title}</h3>
              <p className="text-white/70 mb-4 leading-relaxed">{mode.description}</p>

              <div className="space-y-2 mb-6">
                {mode.features.map((feature) => (
                  <div key={feature} className="flex items-center justify-center text-sm text-white/60">
                    <div className="w-1 h-1 bg-primary-500 rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Games Played:</span>
                  <span className="text-white">{mode.stats.played}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Best Score:</span>
                  <span className="text-white">{formatScore(mode.stats.bestScore)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Wins:</span>
                  <span className="text-white">{mode.stats.wins}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {mode.disabled ? (
                  <div className="flex items-center justify-center text-orange-400 text-sm">
                    <AlertTriangle size={14} className="mr-1" />
                    Desktop Only
                  </div>
                ) : (
                  <div className={`h-1 rounded-full bg-gradient-to-r ${mode.gradient} animate-pulse`} />
                )}
                {!mode.disabled && (
                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Customize ${mode.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onConfigureMode(mode);
                      }}
                    >
                      Customize Mode
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      );
    })}
  </motion.div>
);

export default GameModeGrid;
