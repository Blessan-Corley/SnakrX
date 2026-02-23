import {
  Award,
  GamepadIcon,
  Shield,
  Smartphone,
  Star,
  Target,
  Trophy,
  Users,
  Zap
} from 'lucide-react';

export const LANDING_FEATURES = [
  {
    Icon: GamepadIcon,
    title: 'Classic Mode',
    description: 'Experience the timeless snake game with modern polish and smooth controls.',
    gradient: 'from-green-400 to-emerald-600'
  },
  {
    Icon: Target,
    title: 'VS AI Challenge',
    description: 'Battle against intelligent AI with Easy, Medium, and Impossible difficulty levels.',
    gradient: 'from-blue-400 to-cyan-600'
  },
  {
    Icon: Users,
    title: 'Multiplayer Fun',
    description: 'Compete with friends locally in intense multiplayer snake battles.',
    gradient: 'from-purple-400 to-pink-600'
  },
  {
    Icon: Award,
    title: 'Achievement System',
    description: 'Unlock achievements, earn points, and show off your gaming prowess.',
    gradient: 'from-amber-400 to-orange-600'
  },
  {
    Icon: Trophy,
    title: 'Global Leaderboards',
    description: 'Compete for the top spot and see how you rank against players worldwide.',
    gradient: 'from-red-400 to-rose-600'
  },
  {
    Icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with smooth 60fps gameplay and responsive controls.',
    gradient: 'from-yellow-400 to-amber-600'
  }
];

export const LANDING_STATS = [
  { number: '3', label: 'Game Modes', Icon: GamepadIcon },
  { number: '50+', label: 'Achievements', Icon: Award },
  { number: 'Unlimited', label: 'Fun Factor', Icon: Zap },
  { number: '100%', label: 'Free to Play', Icon: Star }
];

export const LANDING_GAME_MODES = [
  {
    title: 'Classic Mode',
    description: 'Pure snake gameplay with increasing speed and endless fun',
    Icon: GamepadIcon,
    color: 'from-green-400 to-emerald-600'
  },
  {
    title: 'VS AI',
    description: 'Battle against intelligent AI opponents with 3 difficulty levels',
    Icon: Target,
    color: 'from-blue-400 to-cyan-600'
  },
  {
    title: 'Multiplayer',
    description: 'Local multiplayer battles with up to 4 players on one screen',
    Icon: Users,
    color: 'from-purple-400 to-pink-600'
  }
];

export const LANDING_TECH_FEATURES = [
  {
    Icon: Zap,
    title: 'Lightning Fast',
    description: '60fps smooth gameplay with optimized rendering and minimal latency'
  },
  {
    Icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Play on any device with responsive design and touch controls'
  },
  {
    Icon: Shield,
    title: 'Privacy Controls',
    description: 'Manage profile visibility, match-history sharing, and account settings with Firebase-backed auth'
  },
  {
    Icon: Trophy,
    title: 'Achievement System',
    description: 'Track your progress with comprehensive stats and unlock rewards'
  }
];
