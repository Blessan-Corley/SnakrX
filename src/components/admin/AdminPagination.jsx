import Button from '@/components/ui/Button';

export const AdminPagination = ({
  pagination,
  label = 'Items',
  onPrev = () => {},
  onNext = () => {},
  prevAriaLabel = 'Previous page',
  nextAriaLabel = 'Next page',
  disabled = false
}) => {
  if (!pagination) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-white/60">
        {label} Page {pagination.page}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={disabled || !pagination.hasPrev}
          aria-label={prevAriaLabel}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={disabled || !pagination.hasNext}
          aria-label={nextAriaLabel}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminPagination;
