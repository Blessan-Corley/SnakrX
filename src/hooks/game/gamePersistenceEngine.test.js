import { describe, expect, it, vi } from 'vitest';
import { __private__ } from './gamePersistenceEngine.js';
import { persistGameData } from './gamePersistenceEngine.js';

describe('gamePersistenceEngine', () => {
  it('treats sessions with no start time as not meaningful', () => {
    expect(__private__.hasMeaningfulProgress({
      startTime: null,
      foodEaten: 2,
      moves: 10,
      gameTime: 30
    })).toBe(false);
  });

  it('treats sessions with gameplay metrics as meaningful', () => {
    expect(__private__.hasMeaningfulProgress({
      startTime: 123,
      foodEaten: 0,
      moves: 1,
      gameTime: 0
    })).toBe(true);
  });

  it('releases the session marker when the game session fails to save', async () => {
    const savedGameIdsRef = { current: new Set() };

    const result = await persistGameData({
      gameOperations: {
        finalizeGameSession: vi.fn().mockResolvedValue(null)
      },
      gameState: {
        gameId: 'game-1',
        startTime: 1,
        foodEaten: 2,
        moves: 10,
        gameTime: 30,
        score: 50,
        difficulty: null,
        gameMode: 'classic'
      },
      refreshProfile: vi.fn(),
      savedGameIdsRef,
      user: { uid: 'user-1' },
      userProfile: { username: 'alpha', stats: {} },
      victory: true
    });

    expect(result).toBeNull();
    expect(savedGameIdsRef.current.has('game-1')).toBe(false);
  });

  it('keeps the session marker once the session document is persisted', async () => {
    const savedGameIdsRef = { current: new Set() };

    await persistGameData({
      gameOperations: {
        finalizeGameSession: vi.fn().mockResolvedValue({
          success: true,
          gameId: 'game-doc-1',
          statsSnapshot: {
            totalGames: 1,
            totalScore: 42
          }
        })
      },
      gameState: {
        gameId: 'game-2',
        startTime: 1,
        foodEaten: 2,
        moves: 10,
        gameTime: 30,
        score: 0,
        difficulty: null,
        gameMode: 'classic'
      },
      refreshProfile: vi.fn(),
      savedGameIdsRef,
      user: { uid: 'user-1' },
      userProfile: { username: 'alpha', stats: {} },
      victory: true
    });

    expect(savedGameIdsRef.current.has('game-2')).toBe(true);
  });
});
