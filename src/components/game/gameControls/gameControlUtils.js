import { AlertTriangle, Circle } from 'lucide-react';

const difficultyConfig = {
  easy: { name: 'Easy', color: 'text-green-400', Icon: Circle, iconClassName: 'text-green-400' },
  medium: { name: 'Medium', color: 'text-yellow-400', Icon: Circle, iconClassName: 'text-yellow-400' },
  impossible: { name: 'Impossible', color: 'text-red-400', Icon: AlertTriangle, iconClassName: 'text-red-400' }
};

export const getDifficultyConfig = (difficulty) => {
  if (!difficulty) return null;
  return difficultyConfig[difficulty] ?? null;
};

export const buildMultiplayerRanking = (snakes = []) => (
  [...snakes]
    .map((snake, index) => ({
      index,
      score: Number(snake?.score) || 0,
      isAlive: Boolean(snake?.isAlive)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
);
