import Card from '@/components/ui/Card';

const SummaryCard = ({ label, value, className, labelClassName, valueClassName }) => (
  <div className={className}>
    <div className={labelClassName}>{label}</div>
    <div className={valueClassName}>{value}</div>
  </div>
);

const SupportTicketsSummary = ({ ticketSummary }) => (
  <Card variant="glass" padding="md">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-bold text-white">Support Tickets</h2>
        <p className="text-sm text-white/60 mt-1">
          Review tickets, set priority, and respond to players from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[30rem]">
        <SummaryCard
          label="Open Queue"
          value={ticketSummary.open}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
          labelClassName="text-xs uppercase tracking-[0.18em] text-white/45"
          valueClassName="text-2xl font-bold text-white mt-1"
        />
        <SummaryCard
          label="Player Unread"
          value={ticketSummary.needsReply}
          className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3"
          labelClassName="text-xs uppercase tracking-[0.18em] text-amber-200/70"
          valueClassName="text-2xl font-bold text-amber-100 mt-1"
        />
        <SummaryCard
          label="Resolved"
          value={ticketSummary.resolved}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3"
          labelClassName="text-xs uppercase tracking-[0.18em] text-emerald-200/70"
          valueClassName="text-2xl font-bold text-emerald-100 mt-1"
        />
      </div>
    </div>
  </Card>
);

export default SupportTicketsSummary;
