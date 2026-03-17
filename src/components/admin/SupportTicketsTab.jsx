import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Select from '@/components/ui/Select';
import AdminFilterBar from './AdminFilterBar.jsx';
import AdminPagination from './AdminPagination.jsx';
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS
} from './supportTickets/constants.js';
import {
  createTicketDraft
} from './supportTickets/helpers.js';
import SupportTicketCard from './supportTickets/SupportTicketCard.jsx';
import SupportTicketsSummary from './supportTickets/SupportTicketsSummary.jsx';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: '24h', label: 'Past 24 hours' },
  { value: '7d', label: 'Past 7 days' },
  { value: '30d', label: 'Past 30 days' },
  { value: '90d', label: 'Past 90 days' }
];

const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'Recently updated' },
  { value: 'createdAt_desc', label: 'Recently created' },
  { value: 'priority_desc', label: 'Highest priority first' }
];

const FILTER_PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  ...PRIORITY_OPTIONS
];

const inputClassName = 'w-full rounded-xl border border-white/15 bg-slate-950/45 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary-500/40';

export const SupportTicketsTab = ({
  tickets = [],
  summary = {
    open: 0,
    needsReply: 0,
    resolved: 0
  },
  filters,
  loading = false,
  onRefresh = () => {},
  onFilterChange = () => {},
  onApplyFilters = () => {},
  onResetFilters = () => {},
  onUpdateTicket = async () => null,
  pagination,
  onPrevPage = () => {},
  onNextPage = () => {}
}) => {
  const [drafts, setDrafts] = useState({});
  const [savingTicketId, setSavingTicketId] = useState(null);

  useEffect(() => {
    setDrafts((current) => {
      const nextDrafts = {};
      tickets.forEach((ticket) => {
        nextDrafts[ticket.id] = current[ticket.id] || createTicketDraft(ticket);
      });
      return nextDrafts;
    });
  }, [tickets]);

  const updateDraft = (ticketId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [ticketId]: {
        ...(prev[ticketId] || {}),
        [key]: value
      }
    }));
  };

  const handleSave = async (ticketId) => {
    const draft = drafts[ticketId];
    if (!draft) {
      return;
    }

    setSavingTicketId(ticketId);
    try {
      await onUpdateTicket(ticketId, draft);
    } finally {
      setSavingTicketId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SupportTicketsSummary ticketSummary={summary} />

      <AdminFilterBar
        title="Ticket Filters"
        description="Search support conversations, focus unread issues, and keep the inbox responsive with server-side paging."
        onApply={onApplyFilters}
        onReset={onResetFilters}
        onRefresh={onRefresh}
        loading={loading}
      >
        <input
          type="text"
          value={filters.draft.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
          placeholder="Search ticket, user, email, title, or category"
          className={inputClassName}
        />
        <Select
          value={filters.draft.status}
          onChange={(event) => onFilterChange('status', event.target.value)}
          options={STATUS_OPTIONS}
        />
        <Select
          value={filters.draft.priority}
          onChange={(event) => onFilterChange('priority', event.target.value)}
          options={FILTER_PRIORITY_OPTIONS}
        />
        <Select
          value={filters.draft.period}
          onChange={(event) => onFilterChange('period', event.target.value)}
          options={PERIOD_OPTIONS}
        />
        <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-slate-950/45 px-4 py-2.5 text-sm text-white">
          <input
            type="checkbox"
            checked={filters.draft.unreadOnly}
            onChange={(event) => onFilterChange('unreadOnly', event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-950 text-primary-400 focus:ring-primary-500/40"
          />
          Needs player reply only
        </label>
        <div className="md:col-span-2 xl:col-span-2">
          <Select
            value={filters.draft.sortBy}
            onChange={(event) => onFilterChange('sortBy', event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
      </AdminFilterBar>

      <Card variant="glass" padding="lg">
        {loading ? (
          <div className="py-8 text-center">
            <LoadingSpinner />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-10 text-center text-white/70">
            No support tickets found for the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <SupportTicketCard
                key={ticket.id}
                draft={drafts[ticket.id] || createTicketDraft(ticket)}
                index={index}
                isSaving={savingTicketId === ticket.id}
                onSave={handleSave}
                ticket={ticket}
                updateDraft={updateDraft}
              />
            ))}
          </div>
        )}

        <AdminPagination
          pagination={pagination}
          label="Tickets"
          onPrev={onPrevPage}
          onNext={onNextPage}
          prevAriaLabel="Previous tickets page"
          nextAriaLabel="Next tickets page"
          disabled={loading}
        />
      </Card>
    </div>
  );
};
