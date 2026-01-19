/**
 * VS AI Achievements
 */
export const VS_AI_ACHIEVEMENTS = [
  {
    id: 'ai_slayer',
    title: 'AI Slayer',
    description: 'Defeat AI on easy mode',
    icon: 'cpu',
    category: 'vsai',
    tier: 'common',
    points: 15,
    requirements: { aiWins: 1, difficulty: 'easy' }
  },
  {
    id: 'ai_hunter',
    title: 'AI Hunter',
    description: 'Defeat AI on medium mode',
    icon: 'target',
    category: 'vsai',
    tier: 'uncommon',
    points: 30,
    requirements: { aiWins: 1, difficulty: 'medium' }
  },
  {
    id: 'terminator',
    title: 'Terminator',
    description: 'Defeat AI on impossible mode',
    icon: 'cpu',
    category: 'vsai',
    tier: 'epic',
    points: 75,
    requirements: { aiWins: 1, difficulty: 'impossible' }
  },
  {
    id: 'am_i_god',
    title: 'Am I God?',
    description: 'Win 3 consecutive VS AI Impossible matches',
    icon: 'crown',
    category: 'vsai',
    tier: 'legendary',
    points: 100,
    mustDo: 'VS AI Impossible only. Counted only when you win with score above 100. Solo modes do not count.',
    requirements: { aiStreak: 3, difficulty: 'impossible' }
  },
];
