/**
 * Friend & Social Achievements
 */
export const SOCIAL_ACHIEVEMENTS = [
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Add 5 friends',
    icon: 'users',
    category: 'multiplayer',
    tier: 'common',
    points: 15,
    chainId: 'friend_network',
    chainOrder: 1,
    chainTitle: 'Friend Network',
    chainDescription: 'Grow your friend list to complete the chain.',
    requirements: { friendsCount: 5 }
  },
  {
    id: 'squad_goals',
    title: 'Squad Goals',
    description: 'Play a 4-player local multiplayer game',
    icon: 'users',
    category: 'multiplayer',
    tier: 'rare',
    points: 40,
    requirements: { multiplayerGames4Player: 1 }
  },
];
