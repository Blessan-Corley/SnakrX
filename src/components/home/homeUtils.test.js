import { describe, expect, it } from 'vitest';
import {
  buildQuickStats,
  buildRecentLeaderboard,
  getBestGameSubtitle,
  getMemberSinceLabel,
  resolveDateValue
} from './homeUtils.js';

describe('homeUtils', () => {
  it('resolves supported date-like values', () => {
    const timestampObject = {
      toDate: () => new Date('2025-02-01T10:00:00Z')
    };
    const nativeDate = new Date('2025-02-01T10:00:00Z');

    expect(resolveDateValue(timestampObject)?.toISOString()).toBe('2025-02-01T10:00:00.000Z');
    expect(resolveDateValue(nativeDate)?.toISOString()).toBe('2025-02-01T10:00:00.000Z');
    expect(resolveDateValue({ seconds: 1738404000 })?.toISOString()).toBe('2025-02-01T10:00:00.000Z');
    expect(resolveDateValue(1738404000000)?.toISOString()).toBe('2025-02-01T10:00:00.000Z');
    expect(resolveDateValue(null)).toBeNull();
  });

  it('builds the best-game subtitle with mode and formatted date', () => {
    const subtitle = getBestGameSubtitle(
      {
        bestScoreAt: new Date('2025-02-01T10:00:00Z').getTime(),
        bestScoreMode: 'vsai'
      },
      { vsai: 'VS AI' }
    );

    expect(subtitle).toContain('VS AI');
    expect(subtitle).toContain('2025');
  });

  it('builds quick stats with fallbacks', () => {
    const quickStats = buildQuickStats({
      userStats: { totalScore: 1200, bestScore: 300, totalGames: 12 },
      achievementStats: { unlocked: 4, total: 10 },
      totalAchievementPoints: 55,
      modeLabelMap: {}
    });

    expect(quickStats).toHaveLength(4);
    expect(quickStats[0]).toMatchObject({ title: 'Total Score' });
    expect(quickStats[0].trend).toBeUndefined();
    expect(quickStats[2]).toMatchObject({ title: 'Games Played' });
    expect(quickStats[2].trend).toBeUndefined();
    expect(quickStats[3].subtitle).toBe('4/10 unlocked');
  });

  it('builds recent leaderboard entries and appends the user rank when needed', () => {
    const result = buildRecentLeaderboard({
      leaderboardSummary: {
        hasData: true,
        topThree: [
          { userId: 'a', displayName: 'Alpha', score: 1000, mode: 'classic', timestamp: 1738404000000 },
          { userId: 'b', username: 'beta', score: 900, mode: 'vsai', difficulty: 'hard' }
        ],
        userBestRank: { rank: 7, score: 700 }
      },
      loadingLeaderboard: false,
      userProfile: { uid: 'me', displayName: 'Me' }
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ rank: 1, player: 'Alpha', mode: 'Classic' });
    expect(result[1]).toMatchObject({ mode: 'VS AI hard' });
    expect(result[2]).toMatchObject({ rank: 7, player: 'Me', highlighted: true });
  });

  it('returns member-since label from supported createdAt values', () => {
    const label = getMemberSinceLabel({ seconds: 1738404000 });
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);
  });
});
