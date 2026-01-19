/**
 * Multiplayer Achievements
 */
export const MULTIPLAYER_ACHIEVEMENTS = [
  {
    id: 'social_player',
    title: 'Social Player',
    description: 'Play your first multiplayer game',
    icon: 'users',
    category: 'multiplayer',
    tier: 'common',
    points: 10,
    requirements: { multiplayerGames: 1 }
  },
  {
    id: 'last_snake_standing',
    title: 'Last Snake Standing',
    description: 'Win a 4-player game',
    icon: 'crown',
    category: 'multiplayer',
    tier: 'rare',
    points: 50,
    requirements: { multiplayerWins4Player: 1 }
  },
  {
    id: 'four_player_clean_sweep',
    title: 'Full Table Takedown',
    description: 'Win a 4-player game where every player scores at least 50',
    icon: 'crown',
    category: 'multiplayer',
    tier: 'legendary',
    points: 90,
    requirements: { multiplayerWins4PlayerAllAbove50: 1 }
  },
  {
    id: 'multiplayer_dominator',
    title: 'Multiplayer Dominator',
    description: 'Win 10 multiplayer games',
    icon: 'users',
    category: 'multiplayer',
    tier: 'epic',
    points: 75,
    requirements: { multiplayerWins: 10 }
  },
];
