/**
 * Score Achievements
 */
export const SCORE_ACHIEVEMENTS = [
  {
    id: 'first_hundred',
    title: 'Century Club',
    description: 'Score 100 points in a single game',
    icon: 'trophy',
    category: 'score',
    tier: 'common',
    points: 10,
    chainId: 'single_score_ladder',
    chainOrder: 1,
    chainTitle: 'Single-Game Score Ladder',
    chainDescription: 'Push your single-match best score higher each tier.',
    requirements: { singleScore: 100 }
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Score 500 points in a single game',
    icon: 'coins',
    category: 'score',
    tier: 'uncommon',
    points: 25,
    chainId: 'single_score_ladder',
    chainOrder: 2,
    chainTitle: 'Single-Game Score Ladder',
    chainDescription: 'Push your single-match best score higher each tier.',
    requirements: { singleScore: 500 }
  },
  {
    id: 'thousand_points',
    title: 'Thousand Club',
    description: 'Score 1000 points in a single game',
    icon: 'gem',
    category: 'score',
    tier: 'rare',
    points: 50,
    chainId: 'single_score_ladder',
    chainOrder: 3,
    chainTitle: 'Single-Game Score Ladder',
    chainDescription: 'Push your single-match best score higher each tier.',
    requirements: { singleScore: 1000 }
  },
  {
    id: 'single_score_1500',
    title: 'Score Overload',
    description: 'Score 1500 points in a single game',
    icon: 'crown',
    category: 'score',
    tier: 'legendary',
    points: 90,
    chainId: 'single_score_ladder',
    chainOrder: 4,
    chainTitle: 'Single-Game Score Ladder',
    chainDescription: 'Push your single-match best score higher each tier.',
    requirements: { singleScore: 1500 }
  },
  {
    id: 'score_master',
    title: 'Score Master',
    description: 'Accumulate 2000 total points',
    icon: 'trophy',
    category: 'score',
    tier: 'epic',
    points: 75,
    chainId: 'total_score_climb',
    chainOrder: 1,
    chainTitle: 'Total Score Climb',
    chainDescription: 'Build your lifetime score higher across every match.',
    requirements: { totalScore: 2000 }
  },
  {
    id: 'point_millionaire',
    title: 'Point Millionaire',
    description: 'Accumulate 10,000 total points',
    icon: 'crown',
    category: 'score',
    tier: 'legendary',
    points: 150,
    chainId: 'total_score_climb',
    chainOrder: 2,
    chainTitle: 'Total Score Climb',
    chainDescription: 'Build your lifetime score higher across every match.',
    requirements: { totalScore: 10000 }
  },
];
