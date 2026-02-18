import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  AI_DIFFICULTIES,
  CLASSIC_RULES,
  PLAYER_COUNTS,
  getBonusFoodDescription
} from './gamePageConfig';

const GameModeConfigurationPanel = ({
  aiDifficulty,
  bonusFoodToggle,
  onBack,
  onDifficultySelect,
  onPlayerCountSelect,
  onStartGame,
  playerCount,
  selectedMode
}) => {
  if (!selectedMode) {
    return null;
  }

  const SelectedModeIcon = selectedMode.Icon;

  return (
    <motion.div
      key="configuration"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center mb-8">
        <Button
          variant="minimal"
          icon={<ArrowLeft size={18} />}
          onClick={onBack}
          className="mr-4"
        />
        <div className="flex items-center">
          <div className="flex items-center justify-center text-white mr-3">
            <SelectedModeIcon size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedMode.title}</h2>
            <p className="text-white/70">Configure your game settings</p>
          </div>
        </div>
      </div>

      {bonusFoodToggle(getBonusFoodDescription(selectedMode.id))}

      {selectedMode.id === 'vsai' && (
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold text-white">Select Difficulty</h3>
          <div className="grid grid-cols-1 gap-4">
            {AI_DIFFICULTIES.map((difficulty) => {
              const DifficultyIcon = difficulty.Icon;

              return (
                <motion.div
                  key={difficulty.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    variant={aiDifficulty === difficulty.id ? 'gradient' : 'glass'}
                    clickable
                    onClick={() => onDifficultySelect(difficulty.id)}
                    className="transition-all duration-200"
                  >
                    <div className="flex items-center p-4">
                      <div className="text-2xl mr-4">
                        <DifficultyIcon className={difficulty.iconClassName} size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${difficulty.color}`}>{difficulty.name}</h4>
                        <p className="text-white/70 text-sm">{difficulty.description}</p>
                        <p className="text-primary-400 text-sm mt-1">{difficulty.points}</p>
                      </div>
                      {aiDifficulty === difficulty.id && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {selectedMode.id === 'multiplayer' && (
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold text-white">Number of Players</h3>
          <div className="flex space-x-4 justify-center">
            {PLAYER_COUNTS.map((count) => (
              <motion.button
                key={count}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPlayerCountSelect(count)}
                className={`
                  w-16 h-16 rounded-xl border-2 transition-all duration-200
                  ${playerCount === count
                    ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                  }
                `}
              >
                <div className="text-xl font-bold">{count}</div>
              </motion.button>
            ))}
          </div>
          <p className="text-center text-white/60 text-sm">
            Each player will need different keys: WASD, Arrow Keys, IJKL, and Numpad
          </p>
        </div>
      )}

      {selectedMode.id === 'classic' && (
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Game Rules</h3>
          <div className="space-y-3 text-white/70">
            {CLASSIC_RULES.map((rule) => (
              <div key={rule} className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          icon={<Play size={20} />}
          onClick={onStartGame}
          className="px-12 py-4"
        >
          Start Game
        </Button>
      </div>
    </motion.div>
  );
};

export default GameModeConfigurationPanel;
