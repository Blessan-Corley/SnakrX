import {
  AlertTriangle,
  Apple,
  Clock,
  Cpu,
  Crown,
  Flame,
  Gamepad2,
  Sparkles,
  Trophy,
  Users,
  Zap
} from 'lucide-react';

const achievementCategoryIcons = {
  gameplay: <Gamepad2 size={16} />,
  score: <Trophy size={16} />,
  survival: <Clock size={16} />,
  speed: <Zap size={16} />,
  funny: <AlertTriangle size={16} />,
  vsai: <Cpu size={16} />,
  multiplayer: <Users size={16} />,
  special: <Sparkles size={16} />,
  streak: <Flame size={16} />,
  food: <Apple size={16} />,
  leaderboard: <Crown size={16} />
};

export default achievementCategoryIcons;
