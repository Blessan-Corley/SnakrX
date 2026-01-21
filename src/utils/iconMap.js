import {
  Gamepad2,
  Trophy,
  Clock,
  Zap,
  AlertTriangle,
  Cpu,
  Users,
  Sparkles,
  Flame,
  Apple,
  Crown,
  Target,
  Gem,
  Coins,
  Rocket,
  Wind,
  Medal,
  Skull,
  Shield,
  Ghost,
  Feather,
  Star,
  Award
} from 'lucide-react';

export const iconMap = {
  gamepad: Gamepad2,
  trophy: Trophy,
  clock: Clock,
  zap: Zap,
  alert: AlertTriangle,
  cpu: Cpu,
  users: Users,
  sparkles: Sparkles,
  flame: Flame,
  apple: Apple,
  crown: Crown,
  target: Target,
  gem: Gem,
  coins: Coins,
  rocket: Rocket,
  wind: Wind,
  medal: Medal,
  skull: Skull,
  shield: Shield,
  ghost: Ghost,
  feather: Feather,
  star: Star,
  award: Award
};

export const getIconComponent = (key) => {
  return iconMap[key] || Award;
};
