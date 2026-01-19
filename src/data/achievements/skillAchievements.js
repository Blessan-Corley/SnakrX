/**
 * Skill Achievements
 */
export const SKILL_ACHIEVEMENTS = [
  {
    id: 'sniper',
    title: 'Sniper',
    description: 'Eat food within 2 seconds of spawning',
    icon: 'target',
    category: 'speed',
    tier: 'rare',
    points: 35,
    chainId: 'fast_hands',
    chainOrder: 1,
    chainTitle: 'Fast Hands',
    chainDescription: 'Grab food quickly after it spawns to climb the chain.',
    requirements: { fastEats: 1 }
  },
  {
    id: 'close_call',
    title: 'Clutch Driver',
    description: 'Pull off 15 close calls in total',
    icon: 'shield',
    category: 'gameplay',
    tier: 'epic',
    points: 60,
    chainId: 'close_call_artist',
    chainOrder: 1,
    chainTitle: 'Close Call Artist',
    chainDescription: 'Keep surviving near-disasters to push the close-call counter higher.',
    requirements: { closeCalls: 15 }
  },
  {
    id: 'danger_dancer',
    title: 'Danger Dancer',
    description: 'Pull off 40 close calls',
    icon: 'target',
    category: 'gameplay',
    tier: 'legendary',
    points: 90,
    chainId: 'close_call_artist',
    chainOrder: 2,
    chainTitle: 'Close Call Artist',
    chainDescription: 'Keep surviving near-disasters to push the close-call counter higher.',
    requirements: { closeCalls: 40 }
  },
  {
    id: 'quick_hands',
    title: 'Quick Hands',
    description: 'Eat 10 food items within 2 seconds of spawn',
    icon: 'zap',
    category: 'speed',
    tier: 'rare',
    points: 45,
    chainId: 'fast_hands',
    chainOrder: 2,
    chainTitle: 'Fast Hands',
    chainDescription: 'Grab food quickly after it spawns to climb the chain.',
    requirements: { fastEats: 10 }
  },
  {
    id: 'trailblazer',
    title: 'Trailblazer',
    description: 'Reach snake length 40 in a game',
    icon: 'feather',
    category: 'gameplay',
    tier: 'rare',
    points: 50,
    requirements: { maxLength: 40 }
  },
  {
    id: 'marathon_player',
    title: 'Marathon Player',
    description: 'Accumulate 1 hour of total play time',
    icon: 'clock',
    category: 'survival',
    tier: 'epic',
    points: 80,
    requirements: { totalPlayTime: 3600 }
  },
  {
    id: 'move_master',
    title: 'Move Master',
    description: 'Make 10,000 total moves',
    icon: 'rocket',
    category: 'gameplay',
    tier: 'epic',
    points: 70,
    requirements: { moves: 10000 }
  },
  {
    id: 'community_builder',
    title: 'Community Builder',
    description: 'Have 10 friends',
    icon: 'users',
    category: 'multiplayer',
    tier: 'uncommon',
    points: 30,
    chainId: 'friend_network',
    chainOrder: 2,
    chainTitle: 'Friend Network',
    chainDescription: 'Grow your friend list to complete the chain.',
    requirements: { friendsCount: 10 }
  },
];
