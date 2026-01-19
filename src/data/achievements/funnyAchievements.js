/**
 * Funny/Failure Achievements
 */
export const FUNNY_ACHIEVEMENTS = [
  {
    id: 'wall_breaker_bronze',
    title: 'Wall Breaker',
    description: 'Hit the wall 10 times',
    icon: 'alert',
    category: 'funny',
    tier: 'common',
    points: 10,
    chainId: 'wall_crasher',
    chainOrder: 1,
    chainTitle: 'Wall Crasher',
    chainDescription: 'Track every wall crash across matches.',
    requirements: { wallHits: 10 }
  },
  {
    id: 'wall_breaker_silver',
    title: 'Persistent Crasher',
    description: 'Hit the wall 50 times',
    icon: 'alert',
    category: 'funny',
    tier: 'uncommon',
    points: 25,
    chainId: 'wall_crasher',
    chainOrder: 2,
    chainTitle: 'Wall Crasher',
    chainDescription: 'Track every wall crash across matches.',
    requirements: { wallHits: 50 }
  },
  {
    id: 'wall_breaker_gold',
    title: 'Demolition Expert',
    description: 'Hit the wall 100 times',
    icon: 'skull',
    category: 'funny',
    tier: 'rare',
    points: 50,
    chainId: 'wall_crasher',
    chainOrder: 3,
    chainTitle: 'Wall Crasher',
    chainDescription: 'Track every wall crash across matches.',
    requirements: { wallHits: 100 }
  },
  {
    id: 'self_destruct',
    title: 'Self-Destructive',
    description: 'Hit yourself 50 times',
    icon: 'skull',
    category: 'funny',
    tier: 'uncommon',
    points: 20,
    requirements: { selfHits: 50 }
  },
  {
    id: 'oops_master',
    title: 'Oops Master',
    description: 'Die within 5 seconds 20 times',
    icon: 'alert',
    category: 'funny',
    tier: 'rare',
    points: 30,
    requirements: { quickDeaths: 20 }
  },
];
