import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChainAchievementDetail from './ChainAchievementDetail.jsx';

const buildTier = ({
  id,
  title,
  tier,
  points,
  isUnlocked = false,
  isCollected = false,
  isUncollected = false,
  mustDo = null,
  levelTarget
}) => ({
  id,
  title,
  icon: 'flame',
  tier,
  points,
  description: `${title} description`,
  requirements: { level: levelTarget },
  isUnlocked,
  isCollected,
  isUncollected,
  mustDo
});

describe('ChainAchievementDetail', () => {
  it('renders the redesigned chain surface with inline tier navigation and a stable hierarchy', () => {
    render(
      <ChainAchievementDetail
        chainTransitionDirection={1}
        getTierStyling={(tier) => ({
          color: tier === 'rare' ? '#38bdf8' : tier === 'uncommon' ? '#34d399' : '#f59e0b'
        })}
        navigateChainTier={vi.fn()}
        selectedChain={{
          chainTitle: 'Competitive Streak',
          chainDescription: 'Build streaks in VS AI / Multiplayer only.',
          progressLabel: '2/3',
          progressPercent: 67,
          nextTier: { title: 'Grandmaster', isUnlocked: false },
          tiers: [
            buildTier({
              id: 'hat-trick',
              title: 'Hat Trick',
              tier: 'uncommon',
              points: 25,
              isUnlocked: true,
              isCollected: true,
              levelTarget: 3
            }),
            buildTier({
              id: 'streak-surfer',
              title: 'Streak Surfer',
              tier: 'rare',
              points: 45,
              isUnlocked: false,
              mustDo: 'Win without dropping a round lead.',
              levelTarget: 5
            }),
            buildTier({
              id: 'grandmaster',
              title: 'Grandmaster',
              tier: 'legendary',
              points: 80,
              levelTarget: 7
            })
          ]
        }}
        selectedChainTier={buildTier({
          id: 'streak-surfer',
          title: 'Streak Surfer',
          tier: 'rare',
          points: 45,
          levelTarget: 5,
          mustDo: 'Win without dropping a round lead.'
        })}
        selectedChainTierIndex={1}
        selectedChainTierProgress={{
          label: 'Win streak',
          percentage: 40,
          current: 2,
          target: 5
        }}
        selectedChainTierStyling={{ color: '#38bdf8' }}
        userStats={{ level: 2 }}
      />
    );

    expect(screen.getByText('Active tier')).toBeInTheDocument();
    expect(screen.getByText('Tier journey')).toBeInTheDocument();
    expect(screen.queryByText(/chain progress/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Next target: Grandmaster/i)).toBeInTheDocument();

    const tierNavigation = screen.getByRole('navigation', { name: /chain tiers/i });
    expect(within(tierNavigation).getByRole('button', { name: /previous tier/i })).toBeInTheDocument();
    expect(within(tierNavigation).getByRole('button', { name: /next tier/i })).toBeInTheDocument();
    expect(within(tierNavigation).getByRole('button', { name: /go to hat trick/i })).toBeInTheDocument();
    expect(within(tierNavigation).getByRole('button', { name: /go to streak surfer/i })).toBeInTheDocument();
    expect(within(tierNavigation).getByRole('button', { name: /go to grandmaster/i })).toBeInTheDocument();

    expect(screen.getByText('Tier requirements')).toBeInTheDocument();
    expect(screen.getByText('Must do')).toBeInTheDocument();
    expect(screen.getByText('Win without dropping a round lead.')).toBeInTheDocument();
  });
});
