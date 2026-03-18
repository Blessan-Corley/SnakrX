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
  const selectedDifficultyConfig = AI_DIFFICULTIES.find((difficulty) => difficulty.id === aiDifficulty);
  const launchSummary = selectedMode.id === 'vsai'
    ? [
        { label: 'Mode', value: selectedMode.title },
        { label: 'Difficulty', value: selectedDifficultyConfig?.name || 'Medium' },
        { label: 'Scoring', value: selectedDifficultyConfig?.points || '10 points per food' }
      ]
    : selectedMode.id === 'multiplayer'
      ? [
          { label: 'Mode', value: selectedMode.title },
          { label: 'Players', value: `${playerCount} players` },
          { label: 'Controls', value: 'Split keyboard local match' }
        ]
      : [
          { label: 'Mode', value: selectedMode.title },
          { label: 'Rules', value: 'Classic survival run' },
          { label: 'Goal', value: 'Set a new personal best' }
        ];

  return (
    <motion.div
      key="configuration"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-6xl mx-auto"
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left md:text-right">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Ready To Launch</p>
          <p className="mt-1 text-sm text-white/80">Pick your setup, then start immediately.</p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          {selectedMode.id === 'vsai' && (
            <section className="space-y-5">
              <div>
                <h3 className="text-2xl font-semibold text-white">Select Difficulty</h3>
                <p className="mt-2 max-w-3xl text-white/65">
                  Choose how aggressive the AI should be. Each difficulty changes the scoring pace and overall match pressure.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {AI_DIFFICULTIES.map((difficulty) => {
                  const DifficultyIcon = difficulty.Icon;

                  return (
                    <motion.div
                      key={difficulty.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      className="h-full"
                    >
                      <Card
                        variant={aiDifficulty === difficulty.id ? 'gradient' : 'glass'}
                        clickable
                        onClick={() => onDifficultySelect(difficulty.id)}
                        className="h-full transition-all duration-200"
                      >
                        <div className="flex h-full flex-col p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                                aiDifficulty === difficulty.id ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/5'
                              }`}
                            >
                              <DifficultyIcon className={difficulty.iconClassName} size={22} />
                            </div>

                            {aiDifficulty === difficulty.id && (
                              <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-primary-500/30">
                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                              </div>
                            )}
                          </div>

                          <div className="mt-5 flex-1">
                            <h4 className={`text-2xl font-semibold ${difficulty.color}`}>{difficulty.name}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-white/70">{difficulty.description}</p>
                          </div>

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-sm font-medium text-primary-300">{difficulty.points}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
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

              <div className="grid grid-cols-3 gap-4 sm:max-w-xl">
                {PLAYER_COUNTS.map((count) => (
                  <motion.button
                    key={count}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePlayerCountSelect?.(count)}
                    className={`rounded-2xl border px-4 py-6 text-left transition-all duration-200 ${
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
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          {bonusFoodToggle(getBonusFoodDescription(selectedMode.id), 'mb-0')}

          <Card variant="glass" className="overflow-hidden">
            <div className="p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Launch Summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Ready To Start</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Review the selected setup and launch the match when you are ready.
              </p>

              <div className="mt-6 space-y-3">
                {launchSummary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="text-sm text-white/55">{item.label}</span>
                    <span className="text-right text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={<Play size={20} />}
                onClick={onStartGame}
                className="mt-6 w-full justify-center py-4 text-lg"
              >
                Start Game
              </Button>

              <p className="mt-3 text-center text-xs text-white/45">
                You can still go back and adjust these settings before the match begins.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </motion.div>
  );
};

export default GameModeConfigurationPanel;
