import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import {
  SUPPORT_ATTACHMENT_ACCEPT,
  SUPPORT_ATTACHMENT_MAX_COUNT,
  SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES
} from '@/services/firebase/supportAttachments.js';

const SupportRequestForm = ({
  attachments,
  categoryOptions,
  formData,
  formSectionRef,
  onAttachmentChange,
  onReset,
  onSubmit,
  onUpdateField,
  submitting,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.85 }}
    className="mb-12"
    ref={formSectionRef}
  >
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Send a Support Request</h2>
      <p className="text-white/70 text-center mb-6">
        Submit this form to send your request directly to SnakrX support and the admin dashboard.
      </p>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col">
          <label htmlFor="support-name" className="text-sm text-white/70 mb-2">Name</label>
          <input
            id="support-name"
            type="text"
            value={formData.name}
            onChange={(event) => onUpdateField('name', event.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Your name"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="support-email" className="text-sm text-white/70 mb-2">Email</label>
          <input
            id="support-email"
            type="email"
            value={formData.email}
            onChange={(event) => onUpdateField('email', event.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="support-username" className="text-sm text-white/70 mb-2">Username</label>
          <input
            id="support-username"
            type="text"
            value={formData.username}
            onChange={(event) => onUpdateField('username', event.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="SnakrX username"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="support-category" className="text-sm text-white/70 mb-2">Category</label>
          <Select
            id="support-category"
            value={formData.category}
            onChange={(event) => onUpdateField('category', event.target.value)}
            options={categoryOptions}
            className="bg-slate-950/45 border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_16px_40px_rgba(15,23,42,0.35)] hover:border-primary-400/35"
          />
          <p className="text-xs text-white/45 mt-2">
            Choose the closest request type so support can route it faster.
          </p>
        </div>
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="support-title" className="text-sm text-white/70 mb-2">Title</label>
          <input
            id="support-title"
            type="text"
            value={formData.title}
            onChange={(event) => onUpdateField('title', event.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Short summary"
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="support-description" className="text-sm text-white/70 mb-2">Description</label>
          <textarea
            id="support-description"
            value={formData.description}
            onChange={(event) => onUpdateField('description', event.target.value)}
            rows={4}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Steps to reproduce, expected behavior, what happened"
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="support-device" className="text-sm text-white/70 mb-2">Device or Browser</label>
          <input
            id="support-device"
            type="text"
            value={formData.device}
            onChange={(event) => onUpdateField('device', event.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Windows 11, Chrome 121"
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="support-attachments" className="text-sm text-white/70 mb-2">Attachments</label>
          <input
            id="support-attachments"
            type="file"
            multiple
            accept={SUPPORT_ATTACHMENT_ACCEPT}
            onChange={onAttachmentChange}
            className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-white"
          />
          {attachments.length > 0 && (
            <p className="text-xs text-white/50 mt-2">
              Selected: {attachments.map((file) => file.name).join(', ')}
            </p>
          )}
          <p className="text-xs text-white/50 mt-2">
            Upload up to {SUPPORT_ATTACHMENT_MAX_COUNT} files. Each file must be {(SUPPORT_ATTACHMENT_MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB or smaller.
          </p>
        </div>
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" variant="primary" className="flex-1" loading={submitting} disabled={submitting}>
            Send to Support
          </Button>
          <Button type="button" variant="ghost" className="flex-1" onClick={onReset}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  </motion.div>
);

export default SupportRequestForm;
