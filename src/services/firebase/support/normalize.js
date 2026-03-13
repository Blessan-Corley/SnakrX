export const mapTicketDoc = (docSnap) => ({
  id: docSnap.id,
  ...docSnap.data()
});

export const normalizeTicketTime = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  if (typeof value === 'number') return value;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const sortTicketsByRecent = (tickets = []) => [...tickets].sort((left, right) => (
  normalizeTicketTime(right.updatedAt || right.createdAt || right.clientCreatedAt)
    - normalizeTicketTime(left.updatedAt || left.createdAt || left.clientCreatedAt)
));

export const mapAndSortTickets = (docs = []) => sortTicketsByRecent(docs.map(mapTicketDoc));
