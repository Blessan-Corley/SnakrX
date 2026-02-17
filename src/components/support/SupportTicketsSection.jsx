import { motion } from 'framer-motion';
import { BellRing, ShieldAlert, Ticket } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatSupportDate } from './supportUtils.js';
import { normalizeSupportAttachments } from '@/services/firebase/supportAttachments.js';

const SupportTicketsSection = ({
  categoryLabelMap,
  loadingTickets,
  markingSeen,
  onMarkTicketSeen,
  onRefreshTickets,
  priorityStyles,
  statusStyles,
  unreadTicketCount,
  userTickets,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.88 }}
    className="mb-12"
  >
    <Card variant="glass" padding="lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Ticket className="text-primary-300" size={24} />
            Your Support Tickets
          </h2>
          <p className="text-white/65 text-sm mt-1">
            Track your recent requests and any admin updates here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadTicketCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
              <BellRing size={14} />
              {unreadTicketCount} new update{unreadTicketCount > 1 ? 's' : ''}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onRefreshTickets} disabled={loadingTickets}>
            Refresh Tickets
          </Button>
        </div>
      </div>

      {loadingTickets ? (
        <div className="py-8 text-center text-white/70">Loading your tickets...</div>
      ) : userTickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center text-white/65">
          No support tickets yet. Submit the form above and your ticket history will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {userTickets.map((ticket) => {
            const attachments = normalizeSupportAttachments(ticket);

            return (
              <div
                key={ticket.id}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {ticket.title || 'Support request'}
                      </h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[ticket.status] || statusStyles.open}`}>
                        {(ticket.status || 'open').replace('_', ' ')}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[ticket.priority] || priorityStyles.normal}`}>
                        {ticket.priority || 'normal'} priority
                      </span>
                      {ticket.customerUnreadUpdate && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200">
                          New admin update
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                      <span>Ticket ID: {ticket.id}</span>
                      <span>Category: {categoryLabelMap[ticket.category] || ticket.category || 'Other'}</span>
                      <span>Opened: {formatSupportDate(ticket.createdAt || ticket.clientCreatedAt)}</span>
                      <span>Updated: {formatSupportDate(ticket.updatedAt || ticket.lastAdminUpdateAt || ticket.clientCreatedAt)}</span>
                    </div>

                    <p className="text-sm leading-relaxed text-white/72">
                      {ticket.description || 'No description provided.'}
                    </p>

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((attachment) => (
                          attachment.url ? (
                            <a
                              key={`${ticket.id}-${attachment.name}`}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-primary-400/25 bg-primary-500/10 px-3 py-1 text-xs text-primary-100 hover:bg-primary-500/20"
                            >
                              {attachment.name}
                            </a>
                          ) : (
                            <span
                              key={`${ticket.id}-${attachment.name}`}
                              className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs text-white/65"
                            >
                              {attachment.name}
                            </span>
                          )
                        ))}
                      </div>
                    )}

                    {ticket.adminResponse ? (
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200 mb-2">
                          <ShieldAlert size={16} />
                          Latest support update
                        </div>
                        <p className="text-sm leading-relaxed text-emerald-50/90 whitespace-pre-wrap">
                          {ticket.adminResponse}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/55">
                        No support response yet. We will update this ticket when there is progress.
                      </div>
                    )}
                  </div>

                  {ticket.customerUnreadUpdate && (
                    <div className="lg:pl-4">
                      <Button
                        variant="ghost-primary"
                        size="sm"
                        disabled={!!markingSeen[ticket.id]}
                        onClick={() => onMarkTicketSeen(ticket.id)}
                      >
                        {markingSeen[ticket.id] ? 'Updating...' : 'Mark Update Read'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  </motion.div>
);

export default SupportTicketsSection;

