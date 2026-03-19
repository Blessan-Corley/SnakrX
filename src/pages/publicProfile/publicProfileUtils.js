import { resolveGameXpGain } from '@/utils/experience';

export const toDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value === 'number' || typeof value === 'string') return new Date(value);
  return null;
};

export const buildMembershipSummary = (createdAtDate) => {
  if (!createdAtDate) return null;

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - createdAtDate.getTime());
  const totalDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays - (years * 365) - (months * 30);

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0 || parts.length === 0) parts.push(`${days}d`);
  return parts.join(' ');
};

export const formatGameModeLabel = (mode, difficulty) => {
  if (mode === 'vsai') return `VS AI (${difficulty || 'Medium'})`;
  if (mode === 'multiplayer') return 'Multiplayer';
  if (mode === 'classic_transparent') return 'Classic Transparent';
  return 'Classic';
};

export const normalizeHistoryResult = (mode, result) => {
  const normalizedMode = String(mode || '').toLowerCase();
  const normalizedResult = String(result || '').toLowerCase();
  const isClassicSession = normalizedMode === 'classic' || normalizedMode === 'classic_transparent';

  if (isClassicSession) return 'completed';
  if (normalizedResult === 'won' || normalizedResult === 'victory') return 'victory';
  if (normalizedResult === 'lost' || normalizedResult === 'defeat') return 'defeat';
  return 'completed';
};

export const mapGamesToHistory = (games = []) => {
  return games.map((game) => {
    const endedAt = toDate(game.endedAt) || new Date();

    return {
      id: game.id,
      mode: formatGameModeLabel(game.mode, game.difficulty),
      score: game.score || 0,
      time: game.duration || 0,
      date: endedAt,
      result: normalizeHistoryResult(game.mode, game.result),
      xpGained: resolveGameXpGain(game),
      achievements: Array.isArray(game.achievements) ? game.achievements : []
    };
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'Unknown';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
