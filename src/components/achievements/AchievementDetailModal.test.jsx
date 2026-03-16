import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AchievementDetailModal from './AchievementDetailModal.jsx';

vi.mock('@/components/ui/Modal.jsx', () => ({
  default: ({ children, className, contentClassName, size }) => (
    <div
      data-testid="achievement-modal-shell"
      data-size={size}
      data-class-name={className}
      data-content-class-name={contentClassName}
    >
      {children}
    </div>
  )
}));

vi.mock('@/utils/iconMap.js', () => ({
  getIconComponent: () => () => <svg aria-hidden="true" />
}));

vi.mock('./detailModal/ChainAchievementDetail.jsx', () => ({
  default: () => <div>Chain detail</div>
}));

vi.mock('./detailModal/SingleAchievementDetail.jsx', () => ({
  default: () => <div>Single detail</div>
}));

vi.mock('./detailModal/ModalActionButtons.jsx', () => ({
  default: () => <div>Actions</div>
}));

const baseProps = {
  calculateAchievementProgress: vi.fn(),
  chainTransitionDirection: 1,
  collectBurst: null,
  collectingAchievementId: null,
  getTierStyling: vi.fn(() => ({ color: '#34d399' })),
  isAchievementUnlocked: vi.fn(() => false),
  navigateChainTier: vi.fn(),
  onClose: vi.fn(),
  onCollectAction: vi.fn(),
  onShareAchievement: vi.fn(),
  selectedCard: { id: 'selected-card' },
  selectedChain: {
    chainTitle: 'Competitive Streak',
    chainDescription: 'Build streaks in VS AI / Multiplayer only.',
    tiers: []
  },
  selectedChainTier: {
    id: 'hat-trick',
    icon: 'flame'
  },
  selectedChainTierIndex: 0,
  selectedChainTierProgress: {
    label: 'Win streak',
    percentage: 0,
    current: 0,
    target: 3
  },
  selectedChainTierStyling: { color: '#34d399' },
  selectedCollectButtonLabel: 'Collect tier reward',
  selectedCollectableId: '',
  selectedSingleAchievement: {
    id: 'single-achievement',
    icon: 'flame'
  },
  showAchievementModal: true,
  userStats: {}
};

describe('AchievementDetailModal', () => {
  it('uses a wider shell for chain achievement details', () => {
    render(
      <AchievementDetailModal
        {...baseProps}
        selectedIsChain
      />
    );

    expect(screen.getByTestId('achievement-modal-shell')).toHaveAttribute('data-size', '3xl');
    expect(screen.getByTestId('achievement-modal-shell')).toHaveAttribute('data-class-name', 'max-h-[88vh]');
    expect(screen.getByTestId('achievement-modal-shell'))
      .toHaveAttribute('data-content-class-name', 'overflow-y-auto px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-3');
  });

  it('keeps the standard shell for single achievement details', () => {
    render(
      <AchievementDetailModal
        {...baseProps}
        selectedIsChain={false}
      />
    );

    expect(screen.getByTestId('achievement-modal-shell')).toHaveAttribute('data-size', 'xl');
  });
});
