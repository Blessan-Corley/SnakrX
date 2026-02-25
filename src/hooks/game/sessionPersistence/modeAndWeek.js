import { GAME_MODES } from '../../../utils/gameUtils.js';

export const getModeStatsKey = (mode) => {
  if (mode === GAME_MODES.CLASSIC_TRANSPARENT) return 'transparent';
  return mode.replace('_', '');
};

export const getIsoWeekParts = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week
  };
};

export const getIsoWeekKey = (date = new Date()) => {
  const { year, week } = getIsoWeekParts(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

export const isPreviousIsoWeek = (previousKey, currentKey) => {
  if (!previousKey || !currentKey) return false;

  const parseKey = (key) => {
    const match = /^(\d{4})-W(\d{2})$/.exec(key);
    if (!match) return null;
    return {
      year: Number(match[1]),
      week: Number(match[2])
    };
  };

  const previous = parseKey(previousKey);
  const current = parseKey(currentKey);
  if (!previous || !current) return false;

  if (previous.year === current.year) {
    return current.week - previous.week === 1;
  }

  if (current.year - previous.year === 1 && current.week === 1) {
    const dec28 = new Date(Date.UTC(previous.year, 11, 28));
    const { week: lastWeekOfYear } = getIsoWeekParts(dec28);
    return previous.week === lastWeekOfYear;
  }

  return false;
};
