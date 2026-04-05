import { describe, expect, it } from 'vitest';
import {
  buildAchievementStorageKey,
  getGameResultDetails,
  getLatestPendingAchievement,
  getReadyPlayersCount,
  hasActiveSessionState,
  recordShownAchievement,
  resolveGameRouteState,
  SHOWN_ACHIEVEMENT_STORAGE_KEY
} from './gameSessionUtils.js';

describe('gameSessionUtils', () => {
  it('resolves vs ai route state with defaults', () => {
    expect(resolveGameRouteState({
      mode: 'vsai',
      difficulty: undefined,
      playerCount: undefined,
      search: ''
    })).toEqual({
      resolvedMode: 'vsai',
      resolvedDifficulty: 'impossible',
      resolvedPlayerCount: 2,
      resolvedBonusFoodEnabled: true
    });
  });

  it('builds multiplayer score rows in score order', () => {
    const result = getGameResultDetails({
      isMultiplayerMode: true,
      isVictory: false,
      resolvedMode: 'multiplayer',
      score: 0,
      snakes: [
        { score: 10, isAlive: false },
        { score: 30, isAlive: true },
        { score: 20, isAlive: false }
      ]
    });

    expect(result.multiplayerScoreRows.map((row) => row.label)).toEqual([
      'Player 2',
      'Player 3',
      'Player 1'
    ]);
    expect(result.multiplayerWinner?.score).toBe(30);
  });

  it('tracks shown achievements in storage', () => {
    const storage = {
      data: new Map(),
      getItem(key) {
        return this.data.get(key) ?? null;
      },
      setItem(key, value) {
        this.data.set(key, value);
      }
    };

    expect(recordShownAchievement(storage, 'achievement-1')).toBe(true);
    expect(recordShownAchievement(storage, 'achievement-1')).toBe(false);
    expect(JSON.parse(storage.getItem(SHOWN_ACHIEVEMENT_STORAGE_KEY))).toEqual(['achievement-1']);
  });

  it('returns the latest pending achievement and storage key', () => {
    const achievement = getLatestPendingAchievement([
      { id: 'old', collected: true },
      { id: 'new', collected: false, unlockedAt: 123 }
    ]);

    expect(achievement?.id).toBe('new');
    expect(buildAchievementStorageKey(achievement)).toBe('new-123');
  });

  it('computes active session and ready counts', () => {
    expect(hasActiveSessionState({
      gameStatus: 'playing',
      isGameOver: false,
      isPaused: false,
      isVictory: false
    })).toBe(true);
    expect(getReadyPlayersCount({ 0: true, 1: false, 2: true })).toBe(2);
  });
});
