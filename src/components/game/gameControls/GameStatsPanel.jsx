import { Clock, Gamepad2, Target, Trophy, Zap } from 'lucide-react';
import Card from '@/components/ui/Card.jsx';
import { formatScore, formatTime } from '@/utils/gameUtils.js';
import { buildMultiplayerRanking, getDifficultyConfig } from './gameControlUtils.js';

const getPlayerDotColor = (playerIndex) => {
  if (playerIndex === 0) return 'bg-emerald-400';
  if (playerIndex === 1) return 'bg-blue-400';
  if (playerIndex === 2) return 'bg-amber-400';
  return 'bg-fuchsia-400';
};

const GameStatsPanel = ({
  difficulty,
  foodEaten,
  gameMode,
  gameTime,
  score,
  snakes,
  speedMultiplier
}) => {
  const formattedTime = Math.floor(gameTime);
  const multiplayerRanking = gameMode === 'multiplayer' ? buildMultiplayerRanking(snakes) : [];
  const currentDifficulty = getDifficultyConfig(difficulty);

  return (
    <Card variant="glass" padding="md" role="region" aria-label="Game statistics">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Trophy className="mr-2" size={18} aria-hidden="true" />
        Game Stats
      </h3>

      <div className="space-y-4">
        {gameMode === 'multiplayer' ? (
          <div className="space-y-2 mb-4">
            {multiplayerRanking.map((entry) => (
              <div key={entry.index} className="flex justify-between items-center bg-white/5 border border-white/10 rounded px-3 py-2">
                <span className={`text-sm font-bold flex items-center gap-2 ${entry.isAlive ? 'text-white' : 'text-gray-500 line-through'}`}>
                  <span className={`w-2 h-2 rounded-full ${getPlayerDotColor(entry.index)}`} />
                  Player {entry.index + 1}
                </span>
                <span className="text-yellow-400 font-bold">{formatScore(entry.score)}</span>
              </div>
            ))}
            <p className="text-[11px] text-white/60 pt-1">Each food: +10 points per player</p>
          </div>
        ) : gameMode === 'vsai' ? (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
              <span className="text-sm font-bold text-white">You</span>
              <span className="text-yellow-400 font-bold">{formatScore(snakes?.[0]?.score || score || 0)}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
              <span className={`text-sm font-bold ${snakes?.[1]?.isAlive === false ? 'text-gray-500 line-through' : 'text-white'}`}>
                AI
              </span>
              <span className="text-orange-400 font-bold">{formatScore(snakes?.[1]?.score || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center" role="status" aria-live="polite">
            <div className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-1" aria-label={`Current score: ${formatScore(score)}`}>
              {formatScore(score)}
            </div>
            <div className="text-white/60 text-sm">Score</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm" role="list" aria-label="Game metrics">
          <div className="bg-white/5 rounded-lg p-3 text-center" role="listitem">
            <Clock size={16} className="mx-auto mb-1 text-blue-400" aria-hidden="true" />
            <div className="font-bold text-white" aria-label={`Time played: ${formatTime(formattedTime)}`}>{formatTime(formattedTime)}</div>
            <div className="text-white/60 text-xs">Time</div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 text-center" role="listitem">
            <Target size={16} className="mx-auto mb-1 text-green-400" aria-hidden="true" />
            <div className="font-bold text-white" aria-label={`Food eaten: ${foodEaten}`}>{foodEaten}</div>
            <div className="text-white/60 text-xs">Food</div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 text-center" role="listitem">
            <Zap size={16} className="mx-auto mb-1 text-yellow-400" aria-hidden="true" />
            <div className="font-bold text-white" aria-label={`Speed multiplier: ${speedMultiplier.toFixed(1)}x`}>{speedMultiplier.toFixed(1)}x</div>
            <div className="text-white/60 text-xs">Speed</div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 text-center" role="listitem">
            <div className="flex justify-center mb-1">
              <Gamepad2 size={18} className="text-purple-400" />
            </div>
            <div className="font-bold text-white text-xs" aria-label={`Game mode: ${gameMode}`}>{gameMode}</div>
            <div className="text-white/60 text-xs">Mode</div>
          </div>
        </div>

        {currentDifficulty && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-1">
              <currentDifficulty.Icon size={16} className={currentDifficulty.iconClassName} />
            </div>
            <div className={`font-bold ${currentDifficulty.color}`}>
              {currentDifficulty.name}
            </div>
            <div className="text-white/60 text-xs">AI Difficulty</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GameStatsPanel;
