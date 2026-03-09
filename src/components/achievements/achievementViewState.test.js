import { describe, expect, it } from 'vitest';
import { buildAchievementViewState } from './achievementViewState.js';

describe('buildAchievementViewState', () => {
  it('sorts mixed chain and standalone achievements without assuming wrapper titles exist', () => {
    const result = buildAchievementViewState({
      achievements: [
        {
          id: 'single-1',
          title: 'Alpha',
          description: 'Standalone achievement',
          tier: 'rare',
          category: 'gameplay'
        },
        {
          id: 'chain-1-tier-1',
          title: 'Starter',
          chainId: 'chain-1',
          chainTitle: 'Chain One',
          chainDescription: 'Chain description',
          description: 'Tier 1',
          tier: 'common',
          category: 'gameplay',
          chainOrder: 1
        }
      ],
      recentUnlocks: [],
      searchTerm: '',
      selectedCategory: 'all',
      selectedTier: 'all',
      showUnlockedOnly: false,
      unlockedAchievements: [],
      uncollectedAchievements: []
    });

    expect(result.filteredAchievements).toHaveLength(2);
    expect(result.filteredAchievements.map((item) => item.id)).toEqual(['chain-chain-1', 'single-1']);
  });

  it('handles missing standalone titles without crashing', () => {
    const result = buildAchievementViewState({
      achievements: [
        {
          id: 'single-untitled',
          description: 'Untitled achievement',
          tier: 'common',
          category: 'gameplay'
        },
        {
          id: 'single-titled',
          title: 'Named Achievement',
          description: 'Named achievement',
          tier: 'common',
          category: 'gameplay'
        }
      ],
      recentUnlocks: [],
      searchTerm: '',
      selectedCategory: 'all',
      selectedTier: 'all',
      showUnlockedOnly: false,
      unlockedAchievements: [],
      uncollectedAchievements: []
    });

    expect(result.filteredAchievements).toHaveLength(2);
    expect(result.filteredAchievements[0].id).toBe('single-untitled');
    expect(result.filteredAchievements[1].id).toBe('single-titled');
  });

  it('uses the first uncollected unlocked tier as the active chain tier', () => {
    const result = buildAchievementViewState({
      achievements: [
        {
          id: 'level_5',
          title: 'Rookie Grinder',
          description: 'Reach level 5',
          tier: 'common',
          category: 'gameplay',
          chainId: 'xp_grindset',
          chainOrder: 1,
          chainTitle: 'XP Grindset',
          chainDescription: 'Reach higher levels'
        },
        {
          id: 'level_10',
          title: 'Rank Up',
          description: 'Reach level 10',
          tier: 'uncommon',
          category: 'gameplay',
          chainId: 'xp_grindset',
          chainOrder: 2,
          chainTitle: 'XP Grindset',
          chainDescription: 'Reach higher levels'
        }
      ],
      recentUnlocks: [],
      searchTerm: '',
      selectedCategory: 'all',
      selectedTier: 'all',
      showUnlockedOnly: false,
      unlockedAchievements: [{ id: 'level_5' }],
      uncollectedAchievements: [{ id: 'level_5' }]
    });

    expect(result.filteredAchievements).toHaveLength(1);
    expect(result.filteredAchievements[0]).toMatchObject({
      chainId: 'xp_grindset',
      title: 'Rookie Grinder',
      tier: 'common',
      activeTierState: 'ready_to_collect',
      collectableId: 'level_5'
    });
  });

  it('advances a chain card to the next target after the ready tier is collected', () => {
    const result = buildAchievementViewState({
      achievements: [
        {
          id: 'level_5',
          title: 'Rookie Grinder',
          description: 'Reach level 5',
          tier: 'common',
          category: 'gameplay',
          chainId: 'xp_grindset',
          chainOrder: 1,
          chainTitle: 'XP Grindset',
          chainDescription: 'Reach higher levels'
        },
        {
          id: 'level_10',
          title: 'Rank Up',
          description: 'Reach level 10',
          tier: 'uncommon',
          category: 'gameplay',
          chainId: 'xp_grindset',
          chainOrder: 2,
          chainTitle: 'XP Grindset',
          chainDescription: 'Reach higher levels'
        }
      ],
      recentUnlocks: [],
      searchTerm: '',
      selectedCategory: 'all',
      selectedTier: 'all',
      showUnlockedOnly: false,
      unlockedAchievements: [{ id: 'level_5' }],
      uncollectedAchievements: []
    });

    expect(result.filteredAchievements).toHaveLength(1);
    expect(result.filteredAchievements[0]).toMatchObject({
      chainId: 'xp_grindset',
      title: 'Rank Up',
      tier: 'uncommon',
      activeTierState: 'in_progress',
      collectableId: ''
    });
  });

  it('removes fully collected chains from the main grid so they stay in the collected section only', () => {
    const result = buildAchievementViewState({
      achievements: [
        {
          id: 'level_5',
          title: 'Rookie Grinder',
          description: 'Reach level 5',
          tier: 'common',
          category: 'gameplay',
          chainId: 'xp_grindset',
          chainOrder: 1,
          chainTitle: 'XP Grindset',
          chainDescription: 'Reach higher levels'
        }
      ],
      recentUnlocks: [],
      searchTerm: '',
      selectedCategory: 'all',
      selectedTier: 'all',
      showUnlockedOnly: false,
      unlockedAchievements: [{ id: 'level_5' }],
      uncollectedAchievements: []
    });

    expect(result.filteredAchievements).toHaveLength(0);
  });
});
