import { describe, expect, it } from 'vitest';
import {
  normalizeGameSelection,
  getGameRouteFromSelection,
  getSelectionLabel,
  getMostPlayedMode,
  saveLastPlayedMode,
  getLastPlayedMode
} from './gamePreferences.js';

describe('gamePreferences', () => {
  it('normalizes VS AI selection with difficulty', () => {
    const selection = normalizeGameSelection({ mode: 'vsai', difficulty: 'impossible' });
    expect(selection).toEqual({
      mode: 'vsai',
      difficulty: 'impossible',
      playerCount: 2,
      bonusFoodEnabled: true
    });
    expect(getGameRouteFromSelection(selection)).toBe('/game/vsai/impossible');
    expect(getSelectionLabel(selection)).toBe('VS AI (impossible)');
  });

  it('normalizes multiplayer player count and route', () => {
    const selection = normalizeGameSelection({ mode: 'multiplayer', playerCount: 7 });
    expect(selection.playerCount).toBe(4);
    expect(getGameRouteFromSelection(selection)).toBe('/game/multiplayer/4');
  });

  it('adds a query flag when bonus food is disabled', () => {
    const selection = normalizeGameSelection({
      mode: 'classic',
      bonusFoodEnabled: false
    });

    expect(selection.bonusFoodEnabled).toBe(false);
    expect(getGameRouteFromSelection(selection)).toBe('/game/classic?bonusFood=off');
  });

  it('returns most played mode from user stats', () => {
    const mostPlayed = getMostPlayedMode({
      classicGames: 8,
      transparentGames: 3,
      vsaiGames: 12,
      multiplayerGames: 2
    });

    expect(mostPlayed.mode).toBe('vsai');
    expect(mostPlayed.label).toBe('VS AI');
    expect(mostPlayed.count).toBe(12);
  });

  it('persists and restores last played selection', () => {
    const selection = saveLastPlayedMode({ mode: 'multiplayer', playerCount: 3 });
    expect(selection).toEqual({
      mode: 'multiplayer',
      difficulty: null,
      playerCount: 3,
      bonusFoodEnabled: true
    });

    const restored = getLastPlayedMode();
    expect(restored).toEqual({
      mode: 'multiplayer',
      difficulty: null,
      playerCount: 3,
      bonusFoodEnabled: true
    });
  });
});
