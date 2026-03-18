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
  onPlayerCountChange,
  onPlayerCountSelect,
  onStartGame,
  playerCount,
  selectedMode
}) => {
  if (!selectedMode) {
    return null;
  }

  const SelectedModeIcon = selectedMode.Icon;
  const handlePlayerCountSelect = onPlayerCountSelect || onPlayerCountChange;

  return (
    <motion.div
      key="configuration"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="mx-auto max-w-[1120px]"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Button
            variant="minimal"
            icon={<ArrowLeft size={18} />}
            onClick={onBack}
            className="mr-4"
          />
          <div className="flex items-center">
            <div className="mr-3 flex items-center justify-center text-white">
              <SelectedModeIcon size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedMode.title}</h2>
              <p className="text-white/70">Configure your game settings</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex self-start rounded-xl border border-white/20 bg-transparent px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/10 hover:shadow-card md:self-auto"
        >
          View All Modes
        </button>
      </div>

      <div className="space-y-5">
        {bonusFoodToggle(getBonusFoodDescription(selectedMode.id), 'mb-0')}

        {selectedMode.id === 'vsai' && (
          <section className="space-y-5">
            <div>
              <h3 className="text-2xl font-semibold text-white">Select Difficulty</h3>
              <p className="mt-2 max-w-3xl text-white/65">
                Choose how aggressive the AI should be. Each difficulty changes the scoring pace and overall match pressure.
              </p>
            </div>

            <div data-testid="vsai-difficulty-grid" className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {AI_DIFFICULTIES.map((difficulty) => {
                const DifficultyIcon = difficulty.Icon;
                const isSelected = aiDifficulty === difficulty.id;

                return (
                  <motion.button
                    key={difficulty.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDifficultySelect(difficulty.id)}
                    className={`rounded-2xl border px-6 py-6 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 text-white shadow-[0_12px_30px_rgba(249,115,22,0.18)]'
                        : 'border-white/10 text-white/80 hover:border-white/25'
                    }`}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(145deg, rgba(249,115,22,0.12), rgba(15,23,42,0.78))'
                        : 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(15,23,42,0.72))'
                    }}
                  >
                    <div className="flex h-full flex-col justify-between gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${
                            isSelected ? 'border-white/18 bg-white/10' : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <DifficultyIcon className={difficulty.iconClassName} size={22} />
                        </div>

                        {isSelected ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-primary-500/30">
                            <div className="h-2.5 w-2.5 rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-full border border-white/15 bg-white/5" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className={`text-[1.9rem] leading-none font-semibold ${difficulty.color}`}>
                          {difficulty.name}
                        </h4>
                        <p className="text-base leading-relaxed text-white/72">
                          {difficulty.description}
                        </p>
                      </div>

                      <p className="text-sm font-medium text-primary-300">
                        {difficulty.points}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {selectedMode.id === 'multiplayer' && (
          <section className="space-y-5">
            <div>
              <h3 className="text-2xl font-semibold text-white">Number of Players</h3>
              <p className="mt-2 text-white/65">
                Choose how many players will share the screen. Each player uses a separate control layout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PLAYER_COUNTS.map((count) => (
                <motion.button
                  key={count}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlayerCountSelect?.(count)}
                  className={`rounded-2xl border px-5 py-6 text-left transition-all duration-200 ${
                    playerCount === count
                      ? 'border-primary-500 bg-primary-500/15 text-white shadow-[0_12px_30px_rgba(249,115,22,0.18)]'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                  }`}
                >
                  <div className="text-3xl font-bold">{count}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">Players</div>
                </motion.button>
              ))}
            </div>

            <p className="text-sm text-white/60">
              Control layouts: WASD, Arrow Keys, IJKL, and Numpad.
            </p>
          </section>
        )}

        {selectedMode.id === 'classic' && (
          <Card variant="glass" className="overflow-hidden">
            <div className="p-6 md:p-8">
              <h3 className="mb-4 text-xl font-semibold text-white">Game Rules</h3>
              <div className="space-y-4 text-white/70">
                {CLASSIC_RULES.map((rule) => (
                  <div key={rule} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                    <p>{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="pt-2 text-center">
          <Button
            variant="primary"
            size="lg"
            icon={<Play size={20} />}
            onClick={onStartGame}
            className="min-w-[260px] justify-center px-12 py-4 text-lg"
          >
            Start Game
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameModeConfigurationPanel;
