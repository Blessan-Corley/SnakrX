import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Mail, MessageSquare, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  EDITABLE_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_PILL,
  STATUS_PILL
} from './constants.js';
import { formatDateTime } from './helpers.js';
import { normalizeSupportAttachments } from '@/services/firebase/supportAttachments.js';

const SupportTicketCard = ({
  draft,
  index,
  isSaving,
  onSave,
  ticket,
  updateDraft
}) => {
  const attachments = normalizeSupportAttachments(ticket);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3 xl:max-w-[48rem]">
          <div className="flex flex-wrap items-center gap-2">
            <Mail size={14} className="text-primary-300" />
            <p className="text-white font-semibold">{ticket.title || 'Support request'}</p>
            <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_PILL[ticket.status || 'open'] || STATUS_PILL.open}`}>
              {(ticket.status || 'open').replace('_', ' ')}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${PRIORITY_PILL[ticket.priority || 'normal'] || PRIORITY_PILL.normal}`}>
              {(ticket.priority || 'normal')} priority
            </span>
            {ticket.customerUnreadUpdate && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/30">
                User sees new update
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-white/60">
            <span className="inline-flex items-center gap-1">
              <UserRound size={12} />
              {ticket.displayName || ticket.username || 'Unknown user'} ({ticket.email || 'No email'})
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              Opened {formatDateTime(ticket.createdAt || ticket.clientCreatedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={12} />
              Updated {formatDateTime(ticket.updatedAt || ticket.lastAdminUpdateAt || ticket.clientCreatedAt)}
            </span>
          </div>

          <div className="text-sm text-white/75 leading-relaxed">
            {ticket.description || 'No description provided.'}
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                attachment.url ? (
                  <a
                    key={`${ticket.id}-${attachment.name}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-primary-400/25 bg-primary-500/10 px-2.5 py-1 text-xs text-primary-100 hover:bg-primary-500/20"
                  >
                    {attachment.name}
                  </a>
                ) : (
                  <span
                    key={`${ticket.id}-${attachment.name}`}
                    className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-xs text-white/65"
                  >
                    {attachment.name}
                  </span>
                )
              ))}
            </div>
          )}

          {ticket.adminResponse && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200 mb-2">
                <CheckCircle2 size={16} />
                Latest visible support response
              </div>
              <div className="text-sm text-emerald-50/90 whitespace-pre-wrap leading-relaxed">
                {ticket.adminResponse}
              </div>
            </div>
          )}
        </div>

        <div className="w-full xl:w-[21rem] rounded-[1.2rem] border border-white/10 bg-black/10 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2 block">
                Status
              </label>
              <Select
                value={draft.status}
                onChange={(event) => updateDraft(ticket.id, 'status', event.target.value)}
                options={EDITABLE_STATUS_OPTIONS}
                className="bg-slate-950/45 border-white/15"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2 block">
                Priority
              </label>
              <Select
                value={draft.priority}
                onChange={(event) => updateDraft(ticket.id, 'priority', event.target.value)}
                options={PRIORITY_OPTIONS}
                className="bg-slate-950/45 border-white/15"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2 block">
              Player-facing response
            </label>
            <textarea
              rows={5}
              value={draft.adminResponse}
              onChange={(event) => updateDraft(ticket.id, 'adminResponse', event.target.value)}
              placeholder="Add the latest status, next step, or request for more information."
              className="w-full rounded-xl border border-white/15 bg-slate-950/45 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
            Saving here updates the admin dashboard ticket and emails the player when possible.
          </div>

          <Button
            variant="primary"
            fullWidth
            disabled={isSaving}
            onClick={() => onSave(ticket.id)}
          >
            {isSaving ? 'Saving update...' : 'Save Ticket Update'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportTicketCard;
