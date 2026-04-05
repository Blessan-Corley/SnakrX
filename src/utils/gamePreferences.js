import { GAME_MODES } from './gameUtils.js';

const LAST_PLAYED_KEY = 'snakrx:lastPlayedMode';

const modeLabels = {
  [GAME_MODES.CLASSIC]: 'Classic',
  [GAME_MODES.CLASSIC_TRANSPARENT]: 'Transparent',
  [GAME_MODES.VS_AI]: 'VS AI',
  [GAME_MODES.MULTIPLAYER]: 'Multiplayer'
};

const clampPlayerCount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 2;
  return Math.max(2, Math.min(4, Math.floor(parsed)));
};

const normalizeBonusFoodEnabled = (value) => value !== false;

export const normalizeGameSelection = (selection = {}) => {
  const mode = selection.mode || GAME_MODES.CLASSIC;
  const bonusFoodEnabled = normalizeBonusFoodEnabled(selection.bonusFoodEnabled);

  if (mode === GAME_MODES.VS_AI) {
    const difficulty = selection.difficulty || 'impossible';
    return { mode, difficulty, playerCount: 2, bonusFoodEnabled };
  }

  if (mode === GAME_MODES.MULTIPLAYER) {
    return {
      mode,
      difficulty: null,
      playerCount: clampPlayerCount(selection.playerCount),
      bonusFoodEnabled
    };
  }

  return { mode, difficulty: null, playerCount: 1, bonusFoodEnabled };
};

export const getGameRouteFromSelection = (selection = {}) => {
  const normalized = normalizeGameSelection(selection);
  const suffix = normalized.bonusFoodEnabled ? '' : '?bonusFood=off';
  if (normalized.mode === GAME_MODES.VS_AI) {
    return `/game/vsai/${normalized.difficulty}${suffix}`;
  }

  if (normalized.mode === GAME_MODES.MULTIPLAYER) {
    return `/game/multiplayer/${normalized.playerCount}${suffix}`;
  }

  return `/game/${normalized.mode}${suffix}`;
};

export const getSelectionLabel = (selection = {}) => {
  const normalized = normalizeGameSelection(selection);
  if (normalized.mode === GAME_MODES.VS_AI) {
    return `VS AI (${normalized.difficulty})`;
  }
  if (normalized.mode === GAME_MODES.MULTIPLAYER) {
    return `Multiplayer (${normalized.playerCount}P)`;
  }
  return modeLabels[normalized.mode] || 'Classic';
};

export const saveLastPlayedMode = (selection = {}) => {
  const normalized = normalizeGameSelection(selection);
  if (typeof window === 'undefined') return normalized;
  try {
    window.localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage errors (private mode, quota, etc.)
  }
  return normalized;
};

export const getLastPlayedMode = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAST_PLAYED_KEY);
    if (!raw) return null;
    return normalizeGameSelection(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const getMostPlayedMode = (stats = {}) => {
  const modes = [
    { mode: GAME_MODES.CLASSIC, label: modeLabels[GAME_MODES.CLASSIC], count: Number(stats.classicGames) || 0 },
    { mode: GAME_MODES.CLASSIC_TRANSPARENT, label: modeLabels[GAME_MODES.CLASSIC_TRANSPARENT], count: Number(stats.transparentGames) || 0 },
    { mode: GAME_MODES.VS_AI, label: modeLabels[GAME_MODES.VS_AI], count: Number(stats.vsaiGames) || 0 },
    { mode: GAME_MODES.MULTIPLAYER, label: modeLabels[GAME_MODES.MULTIPLAYER], count: Number(stats.multiplayerGames) || 0 }
  ];

  const sorted = [...modes].sort((a, b) => b.count - a.count);
  return sorted[0] || { mode: GAME_MODES.CLASSIC, label: modeLabels[GAME_MODES.CLASSIC], count: 0 };
};
