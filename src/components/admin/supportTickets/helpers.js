export const formatDateTime = (value) => {
  if (!value) {
    return 'Unknown';
  }

  let date = null;
  if (typeof value?.toDate === 'function') {
    date = value.toDate();
  } else if (typeof value?.seconds === 'number') {
    date = new Date(value.seconds * 1000);
  } else if (typeof value === 'number' || typeof value === 'string') {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const buildTicketSummary = (tickets = []) => ({
  open: tickets.filter((ticket) => ['open', 'in_progress', 'pending_user'].includes(ticket.status || 'open')).length,
  needsReply: tickets.filter((ticket) => ticket.customerUnreadUpdate).length,
  resolved: tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length
});

export const filterTickets = ({
  tickets = [],
  searchTerm = '',
  statusFilter = 'all'
}) => {
  const normalized = searchTerm.trim().toLowerCase();

  return tickets.filter((ticket) => {
    if (statusFilter !== 'all' && (ticket.status || 'open') !== statusFilter) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      ticket.id,
      ticket.title,
      ticket.description,
      ticket.email,
      ticket.displayName,
      ticket.username,
      ticket.category
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
};

export const createTicketDraft = (ticket) => ({
  status: ticket.status || 'open',
  priority: ticket.priority || 'normal',
  adminResponse: ticket.adminResponse || ''
});
