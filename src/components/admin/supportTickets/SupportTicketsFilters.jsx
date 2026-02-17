import { RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

const SupportTicketsFilters = ({
  loading,
  onRefresh,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusOptions
}) => (
  <Card variant="glass" padding="md">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by ticket, user, email, or title"
          className="w-full md:w-80 rounded-xl border border-white/15 bg-slate-950/45 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={statusOptions}
          className="min-w-[12rem] bg-slate-950/45 border-white/15"
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        icon={<RefreshCw size={16} />}
        disabled={loading}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </div>
  </Card>
);

export default SupportTicketsFilters;
