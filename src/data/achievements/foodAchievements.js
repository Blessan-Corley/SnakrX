/**
 * Food Achievements (Tiered)
 */
export const FOOD_ACHIEVEMENTS = [
  {
    id: 'food_hunter_bronze',
    title: 'Appetizer',
    description: 'Eat 50 food items',
    icon: 'apple',
    category: 'food',
    tier: 'common',
    points: 10,
    chainId: 'food_hunter',
    chainOrder: 1,
    chainTitle: 'Food Hunter',
    chainDescription: 'Eat more food over time to clear each tier.',
    requirements: { foodEaten: 50 }
  },
  {
    id: 'food_hunter_silver',
    title: 'Hungry Snake',
    description: 'Eat 250 food items',
    icon: 'apple',
    category: 'food',
    tier: 'uncommon',
    points: 25,
    chainId: 'food_hunter',
    chainOrder: 2,
    chainTitle: 'Food Hunter',
    chainDescription: 'Eat more food over time to clear each tier.',
    requirements: { foodEaten: 250 }
  },
  {
    id: 'food_hunter_gold',
    title: 'Feast Master',
    description: 'Eat 1000 food items',
    icon: 'apple',
    category: 'food',
    tier: 'rare',
    points: 50,
    chainId: 'food_hunter',
    chainOrder: 3,
    chainTitle: 'Food Hunter',
    chainDescription: 'Eat more food over time to clear each tier.',
    requirements: { foodEaten: 1000 }
  },
  {
    id: 'food_hunter_platinum',
    title: 'Gluttony God',
    description: 'Eat 5000 food items',
    icon: 'crown',
    category: 'food',
    tier: 'legendary',
    points: 150,
    chainId: 'food_hunter',
    chainOrder: 4,
    chainTitle: 'Food Hunter',
    chainDescription: 'Eat more food over time to clear each tier.',
    requirements: { foodEaten: 5000 }
  }
];
