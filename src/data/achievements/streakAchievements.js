/**
 * Streak Achievements
 */
export const STREAK_ACHIEVEMENTS = [
  {
    id: 'win_streak_3',
    title: 'Hat Trick',
    description: 'Win 3 competitive games in a row',
    icon: 'flame',
    category: 'streak',
    tier: 'uncommon',
    points: 25,
    chainId: 'competitive_streak',
    chainOrder: 1,
    chainTitle: 'Competitive Streak',
    chainDescription: 'Build streaks in VS AI / Multiplayer only.',
    mustDo: 'Only VS AI and Multiplayer count. VS AI wins need score above 100. Ties are losses.',
    requirements: { winStreak: 3 }
  },
  {
    id: 'win_streak_5',
    title: 'Unstoppable',
    description: 'Win 5 competitive games in a row',
    icon: 'star',
    category: 'streak',
    tier: 'rare',
    points: 50,
    chainId: 'competitive_streak',
    chainOrder: 2,
    chainTitle: 'Competitive Streak',
    chainDescription: 'Build streaks in VS AI / Multiplayer only.',
    mustDo: 'Only VS AI and Multiplayer count. VS AI wins need score above 100. Ties are losses.',
    requirements: { winStreak: 5 }
  },
  {
    id: 'win_streak_7',
    title: 'Heat Check',
    description: 'Win 7 competitive games in a row',
    icon: 'flame',
    category: 'streak',
    tier: 'epic',
    points: 75,
    chainId: 'competitive_streak',
    chainOrder: 3,
    chainTitle: 'Competitive Streak',
    chainDescription: 'Build streaks in VS AI / Multiplayer only.',
    mustDo: 'Only VS AI and Multiplayer count. VS AI wins need score above 100. Ties are losses.',
    requirements: { winStreak: 7 }
  },
  {
    id: 'win_streak_11',
    title: 'On Fire Forever',
    description: 'Win 11 competitive games in a row',
    icon: 'crown',
    category: 'streak',
    tier: 'legendary',
    points: 120,
    chainId: 'competitive_streak',
    chainOrder: 4,
    chainTitle: 'Competitive Streak',
    chainDescription: 'Build streaks in VS AI / Multiplayer only.',
    mustDo: 'Only VS AI and Multiplayer count. VS AI wins need score above 100. Ties are losses.',
    requirements: { winStreak: 11 }
  },
];
