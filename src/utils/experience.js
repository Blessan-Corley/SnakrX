export const MAX_PLAYER_LEVEL = 35;
const BASE_XP_PER_LEVEL = 120;
const XP_STEP_PER_LEVEL = 45;

const sanitizeXp = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.floor(numeric);
};

export const getXpRequiredForLevel = (level) => {
  const safeLevel = Math.max(1, Math.min(MAX_PLAYER_LEVEL, Math.floor(level)));
  let total = 0;
  for (let currentLevel = 1; currentLevel < safeLevel; currentLevel += 1) {
    total += BASE_XP_PER_LEVEL + ((currentLevel - 1) * XP_STEP_PER_LEVEL);
  }
  return total;
};

export const getLevelFromXp = (xp) => {
  const normalizedXp = sanitizeXp(xp);

  for (let level = MAX_PLAYER_LEVEL; level >= 1; level -= 1) {
    if (normalizedXp >= getXpRequiredForLevel(level)) {
      return level;
    }
  }

  return 1;
};

export const getXpProgress = (xp) => {
  const normalizedXp = sanitizeXp(xp);
  const level = getLevelFromXp(normalizedXp);
  const currentLevelXp = getXpRequiredForLevel(level);
  const isMaxLevel = level >= MAX_PLAYER_LEVEL;
  const nextLevelXp = isMaxLevel ? currentLevelXp : getXpRequiredForLevel(level + 1);
  const xpIntoLevel = Math.max(0, normalizedXp - currentLevelXp);
  const xpNeededForNext = isMaxLevel ? 0 : Math.max(0, nextLevelXp - normalizedXp);
  const levelSpan = Math.max(1, nextLevelXp - currentLevelXp);
  const progressPercent = isMaxLevel ? 100 : Math.max(0, Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100)));

  return {
    xp: normalizedXp,
    level,
    isMaxLevel,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForNext,
    progressPercent
  };
};

export const calculateGameXpGain = ({
  mode = 'classic',
  difficulty = null,
  duration = 0,
  foodEaten = 0,
  score = 0,
  victory = false
} = {}) => {
  const baseByMode = {
    classic: 20,
    classic_transparent: 24,
    vsai: 28,
    multiplayer: 24
  };

  const difficultyBonus = difficulty === 'impossible'
    ? 14
    : difficulty === 'medium'
      ? 8
      : difficulty === 'easy'
        ? 4
        : 0;

  const normalizedDuration = Math.max(0, Number(duration) || 0);
  const normalizedFood = Math.max(0, Number(foodEaten) || 0);
  const normalizedScore = Math.max(0, Number(score) || 0);

  const durationBonus = Math.min(30, Math.floor(normalizedDuration / 20));
  const foodBonus = Math.min(20, Math.floor(normalizedFood / 4));
  const scoreBonus = Math.min(35, Math.floor(normalizedScore / 200));
  const victoryBonus = victory ? 18 : 0;

  return (
    (baseByMode[mode] || 20) +
    difficultyBonus +
    durationBonus +
    foodBonus +
    scoreBonus +
    victoryBonus
  );
};

const normalizeStoredXpGain = (value) => {
  if (value == null || value === '') return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.floor(numeric);
};

export const resolveGameXpGain = ({
  xpGained,
  mode = 'classic',
  difficulty = null,
  duration = 0,
  foodEaten = 0,
  score = 0,
  result = 'completed',
  victory
} = {}) => {
  const storedXpGain = normalizeStoredXpGain(xpGained);
  if (storedXpGain !== null) {
    return storedXpGain;
  }

  const normalizedResult = String(result || '').toLowerCase();
  return calculateGameXpGain({
    mode,
    difficulty,
    duration,
    foodEaten,
    score,
    victory: typeof victory === 'boolean'
      ? victory
      : normalizedResult === 'won' || normalizedResult === 'victory'
  });
};
