export const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_user', label: 'Pending User' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

export const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== 'all');

export const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal priority' },
  { value: 'high', label: 'High priority' },
  { value: 'urgent', label: 'Urgent priority' }
];

export const STATUS_PILL = {
  open: 'bg-sky-500/15 text-sky-200 border border-sky-400/30',
  in_progress: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  pending_user: 'bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30',
  resolved: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30',
  closed: 'bg-white/10 text-white/70 border border-white/15'
};

export const PRIORITY_PILL = {
  normal: 'bg-white/10 text-white/70 border border-white/15',
  high: 'bg-orange-500/15 text-orange-200 border border-orange-400/30',
  urgent: 'bg-red-500/15 text-red-200 border border-red-400/30'
};
