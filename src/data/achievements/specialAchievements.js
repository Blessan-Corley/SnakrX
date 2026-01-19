/**
 * Special Achievements
 */
export const SPECIAL_ACHIEVEMENTS = [
  {
    id: 'ghost_master',
    title: 'Ghost Master',
    description: 'Score 200+ points in transparent mode',
    icon: 'ghost',
    category: 'special',
    tier: 'uncommon',
    points: 30,
    requirements: { transparentScore: 200 }
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a game without hitting walls (transparent mode)',
    icon: 'shield',
    category: 'special',
    tier: 'rare',
    points: 40,
    requirements: { perfectGame: true }
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Play during the first week of launch',
    icon: 'star',
    category: 'special',
    tier: 'legendary',
    points: 100,
    requirements: { earlyUser: true }
  },
];
