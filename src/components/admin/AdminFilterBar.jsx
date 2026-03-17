import { RefreshCw, RotateCcw, SlidersHorizontal } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const AdminFilterBar = ({
  title = 'Filters',
  description = 'Refine the current admin dataset before fetching the next page.',
  children,
  onApply = () => {},
  onReset = () => {},
  onRefresh = null,
  loading = false,
  applyDisabled = false,
  resetDisabled = false
}) => (
  <Card variant="glass" padding="md">
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white">
            <SlidersHorizontal size={16} className="text-primary-300" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">{title}</h3>
          </div>
          <p className="text-sm text-white/55">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={16} />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={16} />}
            onClick={onReset}
            disabled={loading || resetDisabled}
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onApply}
            loading={loading}
            disabled={applyDisabled}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {children}
      </div>
    </div>
  </Card>
);

export default AdminFilterBar;
