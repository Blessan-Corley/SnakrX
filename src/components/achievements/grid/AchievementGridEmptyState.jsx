import { Trophy } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';

const AchievementGridEmptyState = ({
  onClearFilters,
  searchTerm,
  showUnlockedOnly
}) => (
  <Card variant="glass" padding="lg">
    <div className="text-center py-12">
      <div className="flex items-center justify-center text-6xl mb-4 text-amber-300">
        <Trophy size={48} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Achievements Found</h3>
      <p className="text-white/70 mb-4">
        {searchTerm
          ? `No achievements match "${searchTerm}"`
          : showUnlockedOnly
            ? 'You haven\'t unlocked any achievements in this category yet'
            : 'No achievements in this category'}
      </p>
      {(searchTerm || showUnlockedOnly) && (
        <Button variant="ghost" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  </Card>
);

export default AchievementGridEmptyState;
