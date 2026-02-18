import {
  Circle,
  Clock,
  Cpu,
  Gamepad2,
  Monitor,
  Star,
  Trophy,
  Users
} from 'lucide-react';

export const GAME_PAGE_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const GAME_PAGE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const AI_DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Good for beginners',
    Icon: Circle,
    iconClassName: 'text-green-400',
    points: '5 points per food',
    color: 'text-green-400'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Balanced challenge',
    Icon: Circle,
    iconClassName: 'text-yellow-400',
    points: '10 points per food',
    color: 'text-yellow-400'
  },
  {
    id: 'impossible',
    name: 'Impossible',
    description: 'Ultimate challenge',
    Icon: Circle,
    iconClassName: 'text-red-400',
    points: '20 points per food',
    color: 'text-red-400'
  }
];

export const PLAYER_COUNTS = [2, 3, 4];

export const CLASSIC_MODE_OPTIONS = [
  {
    id: 'classic',
    title: 'Standard Classic',
    description: 'The timeless snake experience with increasing speed.',
    Icon: Gamepad2,
    features: ['Endless gameplay', 'Progressive difficulty']
  },
  {
    id: 'classic_transparent',
    title: 'Transparent Mode',
    description: 'Play with a transparent board and focus on precision.',
    Icon: Monitor,
    features: ['Clear overlays', 'High-contrast snake']
  }
];

export const CLASSIC_RULES = [
  'Eat food to grow longer and increase your score',
  'Speed increases progressively as you eat more food',
  'Avoid hitting walls or your own body',
  'Use WASD or Arrow Keys to control your snake'
];

export const QUICK_STATS = [
  {
    key: 'totalGames',
    title: 'Total Games',
    Icon: Gamepad2,
    subtitle: 'All modes',
    getValue: ({ userStats }) => userStats.totalGames || 0
  },
  {
    key: 'bestScore',
    title: 'Best Score',
    Icon: Trophy,
    subtitle: 'Personal record',
    getValue: ({ userStats, formatScore }) => formatScore(userStats.bestScore || 0)
  },
  {
    key: 'playTime',
    title: 'Play Time',
    Icon: Clock,
    subtitle: 'Total minutes',
    getValue: ({ userStats }) => `${Math.floor((userStats.totalPlayTime || 0) / 60)}m`
  },
  {
    key: 'winRate',
    title: 'Win Rate',
    Icon: Star,
    subtitle: 'Competitive modes',
    getValue: ({ competitiveGames, competitiveWins }) =>
      `${competitiveGames > 0 ? Math.round((competitiveWins / competitiveGames) * 100) : 0}%`
  }
];

export const getGameModes = ({ mobile, userStats }) => [
  {
    id: 'classic',
    title: 'Classic Mode',
    description: 'The timeless snake experience with endless gameplay and increasing speed.',
    Icon: Gamepad2,
    gradient: 'from-green-400 to-emerald-600',
    features: ['Endless gameplay', 'Progressive difficulty', 'Personal best tracking'],
    stats: {
      played: userStats.classicGames || 0,
      bestScore: userStats.classicBestScore || 0,
      wins: userStats.classicWins || 0
    }
  },
  {
    id: 'vsai',
    title: 'VS AI Mode',
    description: 'Challenge intelligent AI opponents with advanced pathfinding algorithms.',
    Icon: Cpu,
    gradient: 'from-blue-400 to-cyan-600',
    features: ['3 Difficulty levels', 'Smart AI opponents', 'Strategy-based gameplay'],
    stats: {
      played: userStats.vsaiGames || 0,
      bestScore: userStats.vsaiBestScore || 0,
      wins: userStats.vsaiWins || 0
    }
  },
  {
    id: 'multiplayer',
    title: 'Multiplayer Mode',
    description: mobile
      ? 'Available on desktop only for the best experience.'
      : 'Local multiplayer battles with friends on one screen.',
    Icon: Users,
    gradient: 'from-purple-400 to-pink-600',
    features: mobile
      ? ['Desktop only', 'Better controls', 'Full experience']
      : ['Up to 4 players', 'Local multiplayer', 'Competitive gameplay'],
    stats: {
      played: userStats.multiplayerGames || 0,
      bestScore: userStats.multiplayerBestScore || 0,
      wins: userStats.multiplayerWins || 0
    },
    disabled: mobile
  }
];

export const getBonusFoodDescription = (modeId) => {
  if (modeId === 'multiplayer') {
    return 'Spawn a shared timed 2x2 bonus fruit. In multiplayer each player can claim it once before it expires.';
  }

  if (modeId === 'vsai') {
    return 'Spawn a timed 2x2 bonus fruit after every 5 normal foods. First collector takes it.';
  }

  return 'Spawn a timed 2x2 bonus fruit after every 5 normal foods. Turn it off for a pure run.';
};
