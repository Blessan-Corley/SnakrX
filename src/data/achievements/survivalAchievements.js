/**
 * Survival Achievements
 */
export const SURVIVAL_ACHIEVEMENTS = [
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Survive for 5 minutes in classic mode',
    icon: 'shield',
    category: 'survival',
    tier: 'uncommon',
    points: 20,
    chainId: 'survival_marathon',
    chainOrder: 1,
    chainTitle: 'Survival Marathon',
    chainDescription: 'Stretch your best classic-mode survival time further each tier.',
    requirements: { survivalTime: 300 }
  },
  {
    id: 'endurance',
    title: 'Endurance',
    description: 'Survive for 7 minutes in classic mode',
    icon: 'clock',
    category: 'survival',
    tier: 'rare',
    points: 40,
    chainId: 'survival_marathon',
    chainOrder: 2,
    chainTitle: 'Survival Marathon',
    chainDescription: 'Stretch your best classic-mode survival time further each tier.',
    requirements: { survivalTime: 420 }
  },
  {
    id: 'immortal',
    title: 'Marathon',
    description: 'Survive for 15 minutes in classic mode',
    icon: 'crown',
    category: 'survival',
    tier: 'legendary',
    points: 100,
    chainId: 'survival_marathon',
    chainOrder: 3,
    chainTitle: 'Survival Marathon',
    chainDescription: 'Stretch your best classic-mode survival time further each tier.',
    requirements: { survivalTime: 900 }
  },
];
