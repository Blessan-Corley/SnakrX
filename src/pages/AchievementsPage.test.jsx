import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import AchievementsPage from './AchievementsPage.jsx';

const collectAllAchievementsMock = vi.fn();
const collectAchievementMock = vi.fn();

const authState = {
  userProfile: {
    stats: {
      foodEaten: 435,
      games: 1,
      level: 7,
      achievements: [{ id: 'first_game', collected: false }]
    }
  }
};

const operationsState = {
  achievements: [],
  unlockedAchievements: [],
  achievementTiers: {
    common: { color: '#cbd5e1' },
    uncommon: { color: '#34d399' },
    legendary: { color: '#f59e0b' }
  },
  recentUnlocks: [],
  getAchievementStats: () => ({
    unlocked: 1,
    total: 2,
    byTier: {
      common: { unlocked: 1, total: 1, percentage: 100 },
      legendary: { unlocked: 0, total: 1, percentage: 0 }
    }
  }),
  isAchievementUnlocked: () => false,
  calculateAchievementProgress: () => 0,
  shareAchievement: vi.fn(),
  getTotalPointsEarned: () => 0,
  getCompletionPercentage: () => 50,
  collectAchievement: collectAchievementMock,
  collectAllAchievements: collectAllAchievementsMock,
  uncollectedAchievements: []
};

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => authState
}));

vi.mock('../hooks/useAchievements.js', () => ({
  useAchievementOperations: () => operationsState
}));

describe('AchievementsPage', () => {
  beforeEach(() => {
    collectAllAchievementsMock.mockReset();
    collectAchievementMock.mockReset();
    collectAchievementMock.mockResolvedValue(true);

    operationsState.achievements = [
      {
        id: 'food_hunter_platinum',
        title: 'Food Hunter Platinum',
        description: 'Eat 5000 food',
        tier: 'legendary',
        category: 'food',
        points: 200,
        icon: 'apple',
        requirements: { foodEaten: 5000 }
      },
      {
        id: 'first_game',
        title: 'First Game',
        description: 'Play first game',
        tier: 'common',
        category: 'gameplay',
        points: 10,
        icon: 'gamepad-2',
        requirements: { games: 1 }
      }
    ];
    operationsState.unlockedAchievements = [
      {
        id: 'first_game',
        title: 'First Game',
        description: 'Play first game',
        tier: 'common',
        category: 'gameplay',
        points: 10,
        icon: 'gamepad-2',
        collected: false,
        timestamp: Date.now()
      }
    ];
    operationsState.recentUnlocks = [
      {
        id: 'first_game',
        title: 'First Game',
        description: 'Play first game',
        tier: 'common',
        category: 'gameplay',
        points: 10,
        icon: 'gamepad-2',
        collected: false,
        timestamp: Date.now()
      }
    ];
    operationsState.uncollectedAchievements = [
      {
        id: 'first_game',
        title: 'First Game',
        points: 10,
        icon: 'gamepad-2'
      }
    ];
    operationsState.isAchievementUnlocked = (id) => id === 'first_game';
    operationsState.calculateAchievementProgress = (achievement) => (achievement.id === 'food_hunter_platinum' ? 9 : 100);
  });

  it('shows numeric progress counters and allows collect all', async () => {
    render(<AchievementsPage />);

    expect(screen.getByText('435/5000')).toBeInTheDocument();
    expect(screen.getByText(/1 Achievement Ready to Collect/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /collect all/i }));
    });
    expect(collectAllAchievementsMock).toHaveBeenCalledTimes(1);
  });

  it('shows chain detail modal with tier navigation and focused progress details', async () => {
    operationsState.achievements = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        chainId: 'xp_grindset',
        chainOrder: 1,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 5 }
      },
      {
        id: 'level_10',
        title: 'Rank Up',
        description: 'Reach level 10',
        tier: 'uncommon',
        category: 'gameplay',
        points: 25,
        icon: 'medal',
        mustDo: 'Keep your profile level climbing with real matches.',
        chainId: 'xp_grindset',
        chainOrder: 2,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 10 }
      }
    ];
    operationsState.unlockedAchievements = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        collected: false,
        timestamp: Date.now()
      }
    ];
    operationsState.uncollectedAchievements = [
      { id: 'level_5', title: 'Rookie Grinder', points: 15, icon: 'star' }
    ];
    operationsState.recentUnlocks = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        collected: false,
        timestamp: Date.now()
      }
    ];
    operationsState.isAchievementUnlocked = (id) => id === 'level_5';
    operationsState.calculateAchievementProgress = (achievement) => (achievement.id === 'level_10' ? 80 : 100);

    render(<AchievementsPage />);

    await act(async () => {
      fireEvent.click(screen.getByText('XP Grindset'));
    });

    const dialogs = await screen.findAllByRole('dialog');
    const modal = dialogs[dialogs.length - 1];

    expect(within(modal).getByText('Chain Progress')).toBeInTheDocument();
    expect(within(modal).getByText('Rookie Grinder')).toBeInTheDocument();
    expect(within(modal).getByText('Tier 1 of 2')).toBeInTheDocument();
    expect(within(modal).getByText('Reward Ready')).toBeInTheDocument();
    expect(within(modal).queryByRole('button', { name: /previous tier/i })).not.toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: /next tier/i })).toBeInTheDocument();
    expect(within(modal).queryByRole('button', { name: /collect this tier/i })).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(within(modal).getByRole('button', { name: /collect tier reward/i }));
    });
    expect(collectAchievementMock).toHaveBeenCalledWith('level_5');

    await act(async () => {
      fireEvent.click(within(modal).getByRole('button', { name: /next tier/i }));
    });

    expect(within(modal).getByText('Tier 2 of 2')).toBeInTheDocument();
    expect(within(modal).getByText('Rank Up')).toBeInTheDocument();
    expect(within(modal).getAllByText('Player level').length).toBeGreaterThan(0);
    expect(within(modal).getAllByText('7/10').length).toBeGreaterThan(0);
    expect(within(modal).getByText(/Keep your profile level climbing/i)).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: /previous tier/i })).toBeInTheDocument();
    expect(within(modal).queryByRole('button', { name: /next tier/i })).not.toBeInTheDocument();
  }, 10000);

  it('supports keyboard navigation for chain tiers', async () => {
    operationsState.achievements = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        chainId: 'xp_grindset',
        chainOrder: 1,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 5 }
      },
      {
        id: 'level_10',
        title: 'Rank Up',
        description: 'Reach level 10',
        tier: 'uncommon',
        category: 'gameplay',
        points: 25,
        icon: 'medal',
        chainId: 'xp_grindset',
        chainOrder: 2,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 10 }
      },
      {
        id: 'level_15',
        title: 'Snake Veteran',
        description: 'Reach level 15',
        tier: 'rare',
        category: 'gameplay',
        points: 35,
        icon: 'trophy',
        chainId: 'xp_grindset',
        chainOrder: 3,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 15 }
      }
    ];
    operationsState.unlockedAchievements = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        collected: true,
        timestamp: Date.now()
      }
    ];
    operationsState.uncollectedAchievements = [];
    operationsState.recentUnlocks = [];
    operationsState.isAchievementUnlocked = (id) => id === 'level_5';
    operationsState.calculateAchievementProgress = (achievement) => {
      if (achievement.id === 'level_10') return 70;
      if (achievement.id === 'level_15') return 47;
      return 100;
    };
    authState.userProfile.stats.level = 7;

    render(<AchievementsPage />);

    await act(async () => {
      fireEvent.click(screen.getByText('XP Grindset'));
    });

    const dialogs = await screen.findAllByRole('dialog');
    const modal = dialogs[dialogs.length - 1];

    expect(within(modal).getByText('Tier 2 of 3')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'ArrowRight' });
    });
    expect(within(modal).getByText('Tier 3 of 3')).toBeInTheDocument();
    expect(within(modal).getByText('Snake Veteran')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Home' });
    });
    expect(within(modal).getByText('Tier 1 of 3')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'End' });
    });
    expect(within(modal).getByText('Tier 3 of 3')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
    });
    expect(within(modal).getByText('Tier 2 of 3')).toBeInTheDocument();
  });

  it('shows a collect action directly on chain cards when the current tier reward is ready', async () => {
    operationsState.achievements = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        chainId: 'xp_grindset',
        chainOrder: 1,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 5 }
      },
      {
        id: 'level_10',
        title: 'Rank Up',
        description: 'Reach level 10',
        tier: 'uncommon',
        category: 'gameplay',
        points: 25,
        icon: 'medal',
        chainId: 'xp_grindset',
        chainOrder: 2,
        chainTitle: 'XP Grindset',
        chainDescription: 'Reach higher levels',
        requirements: { level: 10 }
      }
    ];
    operationsState.unlockedAchievements = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        collected: false,
        timestamp: Date.now()
      }
    ];
    operationsState.uncollectedAchievements = [
      { id: 'level_5', title: 'Rookie Grinder', points: 15, icon: 'star' }
    ];
    operationsState.recentUnlocks = [
      {
        id: 'level_5',
        title: 'Rookie Grinder',
        description: 'Reach level 5',
        tier: 'common',
        category: 'gameplay',
        points: 15,
        icon: 'star',
        collected: false,
        timestamp: Date.now()
      }
    ];
    operationsState.isAchievementUnlocked = (id) => id === 'level_5';
    authState.userProfile.stats.level = 7;

    render(<AchievementsPage />);

    expect(screen.getAllByText('Rookie Grinder').length).toBeGreaterThan(0);
    const collectButtons = screen.getAllByRole('button', { name: /^collect$/i });
    expect(collectButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(collectButtons[0]);
    });

    expect(collectAchievementMock).toHaveBeenCalledWith('level_5');
  });
});
