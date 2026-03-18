import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MatchHistoryTab } from './MatchHistoryTab.jsx';

describe('Profile MatchHistoryTab', () => {
  it('shows the xp gained for each match', () => {
    render(
      <MatchHistoryTab
        mockMatchHistory={[
          {
            id: 'm-1',
            mode: 'VS AI (Medium)',
            score: 500,
            time: 42,
            result: 'victory',
            xpGained: 63,
            date: new Date('2026-03-19T10:00:00Z'),
            achievements: []
          }
        ]}
      />
    );

    expect(screen.getByText('+63 XP')).toBeInTheDocument();
    expect(screen.getByText('Victory')).toBeInTheDocument();
  });
});
