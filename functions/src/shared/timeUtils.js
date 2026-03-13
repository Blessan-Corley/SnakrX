const { admin } = require('../runtime');

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getIsoWeekParts = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week
  };
};

const getIsoWeekKey = (date = new Date()) => {
  const { year, week } = getIsoWeekParts(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const getPreviousWeekWindow = (referenceDate = new Date()) => {
  const utcReference = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  ));
  const dayOfWeek = utcReference.getUTCDay() || 7;
  const currentWeekStart = new Date(utcReference);
  currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - dayOfWeek + 1);
  currentWeekStart.setUTCHours(0, 0, 0, 0);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);

  const previousWeekEnd = new Date(currentWeekStart);

  return {
    weekKey: getIsoWeekKey(previousWeekStart),
    startMs: previousWeekStart.getTime(),
    endMs: previousWeekEnd.getTime(),
    startTimestamp: admin.firestore.Timestamp.fromMillis(previousWeekStart.getTime()),
    endTimestamp: admin.firestore.Timestamp.fromMillis(previousWeekEnd.getTime())
  };
};

const parseWeekKey = (weekKey) => {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey || '');
  if (!match) return null;

  return {
    year: Number(match[1]),
    week: Number(match[2])
  };
};

const isPreviousIsoWeekKey = (previousKey, currentKey) => {
  if (!previousKey || !currentKey) return false;
  const previous = parseWeekKey(previousKey);
  const current = parseWeekKey(currentKey);
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

module.exports = {
  toMillis,
  getIsoWeekParts,
  getIsoWeekKey,
  getPreviousWeekWindow,
  parseWeekKey,
  isPreviousIsoWeekKey
};
