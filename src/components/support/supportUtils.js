export const formatSupportDate = (value) => {
  if (!value) return 'Unknown';

  let date = null;
  if (typeof value?.toDate === 'function') {
    date = value.toDate();
  } else if (typeof value?.seconds === 'number') {
    date = new Date(value.seconds * 1000);
  } else if (typeof value === 'number' || typeof value === 'string') {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) return 'Unknown';

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

export const mapSupportCategoryToFormCategory = (categoryId) => {
  if (categoryId === 'bugs') return 'bug_report';
  if (categoryId === 'account') return 'account_recovery';
  if (categoryId === 'gameplay') return 'gameplay_support';
  return 'other';
};
