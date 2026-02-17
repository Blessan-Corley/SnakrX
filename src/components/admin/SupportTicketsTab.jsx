import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  STATUS_OPTIONS
} from './supportTickets/constants.js';
import {
  buildTicketSummary,
  createTicketDraft,
  filterTickets
} from './supportTickets/helpers.js';
import SupportTicketCard from './supportTickets/SupportTicketCard.jsx';
import SupportTicketsFilters from './supportTickets/SupportTicketsFilters.jsx';
import SupportTicketsSummary from './supportTickets/SupportTicketsSummary.jsx';

export const SupportTicketsTab = ({
  tickets = [],
  loading = false,
  onRefresh = () => {},
  onUpdateTicket = async () => null
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const ticketSummary = useMemo(() => buildTicketSummary(tickets), [tickets]);
  const filteredTickets = useMemo(() => filterTickets({
    tickets,
    searchTerm,
    statusFilter
  }), [searchTerm, statusFilter, tickets]);

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
      <SupportTicketsSummary ticketSummary={ticketSummary} />

      <SupportTicketsFilters
        loading={loading}
        onRefresh={onRefresh}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={STATUS_OPTIONS}
      />

      <Card variant="glass" padding="lg">
        {loading ? (
          <div className="py-8 text-center">
            <LoadingSpinner />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-10 text-center text-white/70">
            No support tickets found for the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket, index) => (
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
      </Card>
    </div>
  );
};
