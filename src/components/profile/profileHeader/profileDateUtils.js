export const resolveProfileDate = (value, fallback = null) => {
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (value) return new Date(value);
  return fallback;
};

export const formatMembershipSummary = (createdAtDate) => {
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
