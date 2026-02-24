import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCollection = vi.fn();
const mockGetDocs = vi.fn();
const mockQuery = vi.fn((...args) => ({ args }));
const mockWhere = vi.fn((...args) => ({ type: 'where', args }));
const mockOrderBy = vi.fn((...args) => ({ type: 'orderBy', args }));
const mockLimit = vi.fn((value) => ({ type: 'limit', value }));
const mockHttpsCallable = vi.fn();

const mockValidateGameSession = vi.fn();
const mockCheckApiLimit = vi.fn();

vi.mock('./config.js', () => ({
  db: {},
  collection: (...args) => mockCollection(...args),
  getDocs: (...args) => mockGetDocs(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  functions: {},
  httpsCallable: (...args) => mockHttpsCallable(...args),
  COLLECTIONS: {
    GAMES: 'games'
  }
}));

vi.mock('../../utils/validation.js', () => ({
  validateInput: {
    gameSession: (...args) => mockValidateGameSession(...args)
  },
  rateLimiters: {
    checkApiLimit: (...args) => mockCheckApiLimit(...args)
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

const createDocSnap = (id, data) => ({
  id,
  data: () => data
});

describe('gameOperations', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockCollection.mockReturnValue({ path: 'games' });
    mockValidateGameSession.mockReturnValue({
      valid: true,
      data: { mode: 'classic', difficulty: null, score: 420 }
    });
    mockCheckApiLimit.mockReturnValue(true);
    mockGetDocs.mockResolvedValue({ docs: [] });
    mockHttpsCallable.mockImplementation((_functions, name) => {
      if (name === 'getPublicRecentGames') {
        return vi.fn().mockResolvedValue({ data: { games: [] } });
      }

      if (name === 'finalizeGameSession') {
        return vi.fn().mockResolvedValue({
          data: {
            success: true,
            gameId: 'game-doc-1',
            statsSnapshot: { totalGames: 1 }
          }
        });
      }

      return vi.fn();
    });

    const module = await import('./game.js');
    module.__private__.resetCallables();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws when game session validation fails', async () => {
    mockValidateGameSession.mockReturnValueOnce({
      valid: false,
      errors: ['score must be positive']
    });
    const { gameOperations } = await import('./game.js');

    await expect(gameOperations.finalizeGameSession('u1', { mode: 'classic' }))
      .rejects.toThrow(/invalid game data/i);
  });

  it('throws when user exceeds finalization rate limit', async () => {
    mockCheckApiLimit.mockReturnValueOnce(false);
    const { gameOperations } = await import('./game.js');

    await expect(gameOperations.finalizeGameSession('u1', { mode: 'classic', score: 100 }))
      .rejects.toThrow(/too many requests/i);
  });

  it('finalizes game sessions through the callable backend endpoint', async () => {
    const finalizeCallable = vi.fn().mockResolvedValue({
      data: {
        success: true,
        gameId: 'game-doc-9',
        statsSnapshot: { totalGames: 5, totalScore: 900 }
      }
    });
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('finalizeGameSession');
      return finalizeCallable;
    });

    const { gameOperations } = await import('./game.js');

    const result = await gameOperations.finalizeGameSession('u1', {
      gameId: 'g-1',
      mode: 'classic',
      score: 420,
      result: 'won',
      stats: {
        moves: 50,
        wallHits: 1
      }
    });

    expect(result).toEqual({
      success: true,
      gameId: 'game-doc-9',
      statsSnapshot: { totalGames: 5, totalScore: 900 }
    });
    expect(finalizeCallable).toHaveBeenCalledWith({
      session: expect.objectContaining({
        gameId: 'g-1',
        mode: 'classic',
        difficulty: null,
        score: 420,
        result: 'won'
      })
    });
  });

  it('saveGameSession remains compatible and returns the finalized document id', async () => {
    const { gameOperations } = await import('./game.js');

    const id = await gameOperations.saveGameSession('u1', {
      gameId: 'g-2',
      mode: 'classic',
      score: 250
    });

    expect(id).toBe('game-doc-1');
  });

  it('returns null when authoritative finalization keeps failing', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('finalizeGameSession');
      return vi.fn().mockRejectedValueOnce(new Error('network down'));
    });

    const { gameOperations } = await import('./game.js');
    const result = await gameOperations.finalizeGameSession('u1', {
      gameId: 'g-3',
      mode: 'classic',
      score: 180
    }, 1);

    expect(result).toBeNull();
  });

  it('retries transient callable failures and eventually succeeds', async () => {
    vi.useFakeTimers();
    const finalizeCallable = vi.fn()
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockResolvedValueOnce({
        data: {
          success: true,
          gameId: 'game-doc-3',
          statsSnapshot: { totalGames: 2 }
        }
      });
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('finalizeGameSession');
      return finalizeCallable;
    });

    const { gameOperations } = await import('./game.js');
    const finalizePromise = gameOperations.finalizeGameSession('u1', {
      gameId: 'g-4',
      mode: 'classic',
      score: 180
    }, 2);

    await vi.runAllTimersAsync();
    await expect(finalizePromise).resolves.toEqual({
      success: true,
      gameId: 'game-doc-3',
      statsSnapshot: { totalGames: 2 }
    });
    expect(finalizeCallable).toHaveBeenCalledTimes(2);
  });

  it('stops retrying on failed-precondition errors', async () => {
    const finalizeCallable = vi.fn().mockRejectedValueOnce(Object.assign(new Error('denied'), {
      code: 'failed-precondition'
    }));
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('finalizeGameSession');
      return finalizeCallable;
    });
    const { gameOperations } = await import('./game.js');

    const result = await gameOperations.finalizeGameSession('u1', {
      gameId: 'g-5',
      mode: 'classic',
      score: 90
    }, 3);

    expect(result).toBeNull();
    expect(finalizeCallable).toHaveBeenCalledTimes(1);
  });

  it('returns recent games from the primary indexed query', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        createDocSnap('g-10', { score: 100 }),
        createDocSnap('g-11', { score: 80 })
      ]
    });
    const { gameOperations } = await import('./game.js');

    const games = await gameOperations.getUserGames('u1', 2);

    expect(games).toEqual([
      { id: 'g-10', score: 100 },
      { id: 'g-11', score: 80 }
    ]);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  });

  it('falls back to client-side sort when composite index is missing', async () => {
    mockGetDocs
      .mockRejectedValueOnce(Object.assign(new Error('index required'), {
        code: 'failed-precondition',
        message: 'requires an index'
      }))
      .mockResolvedValueOnce({
        docs: [
          createDocSnap('g1', { endedAt: { seconds: 110 }, score: 20 }),
          createDocSnap('g2', { endedAt: { toMillis: () => 150000 }, score: 30 }),
          createDocSnap('g3', { endedAt: 120000, score: 40 })
        ]
      });

    const { gameOperations } = await import('./game.js');
    const games = await gameOperations.getUserGames('u1', 2);

    expect(games).toEqual([
      { id: 'g2', endedAt: { toMillis: expect.any(Function) }, score: 30 },
      { id: 'g3', endedAt: 120000, score: 40 }
    ]);
    expect(mockGetDocs).toHaveBeenCalledTimes(2);
  });

  it('returns empty array when both main and fallback queries fail', async () => {
    mockGetDocs
      .mockRejectedValueOnce(Object.assign(new Error('index required'), {
        code: 'failed-precondition',
        message: 'missing index'
      }))
      .mockRejectedValueOnce(new Error('network down'));

    const { gameOperations } = await import('./game.js');
    const games = await gameOperations.getUserGames('u1', 5);

    expect(games).toEqual([]);
    expect(mockGetDocs).toHaveBeenCalledTimes(2);
  });

  it('fetches public recent games through callable backend endpoint', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('getPublicRecentGames');
      return vi.fn().mockResolvedValue({
        data: {
          games: [{ id: 'g-public', score: 900 }]
        }
      });
    });

    const { gameOperations } = await import('./game.js');
    const games = await gameOperations.getPublicRecentGames('u-public', 5);

    expect(games).toEqual([{ id: 'g-public', score: 900 }]);
  });
});
