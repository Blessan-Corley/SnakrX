import { motion } from 'framer-motion';
import { CheckCircle, Search } from 'lucide-react';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_TIERS } from '@/data/achievements.js';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import Select from '@/components/ui/Select.jsx';

const AchievementFilters = ({
  categoryIcons,
  searchTerm,
  selectedCategory,
  selectedTier,
  showUnlockedOnly,
  onCategoryChange,
  onSearchChange,
  onTierChange,
  onToggleUnlockedOnly,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-8"
  >
    <Card variant="glass" padding="md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange('all')}
          >
            All Categories
          </Button>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'primary' : 'ghost'}
              size="sm"
              icon={categoryIcons[key]}
              onClick={() => onCategoryChange(key)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-48"
            />
          </div>

          <Select
            value={selectedTier}
            onChange={(event) => onTierChange(event.target.value)}
            aria-label="Filter by achievement tier"
            className="w-40"
            options={[
              { value: 'all', label: 'All Tiers' },
              ...Object.keys(ACHIEVEMENT_TIERS).map((tier) => ({
                value: tier,
                label: `${tier.charAt(0).toUpperCase()}${tier.slice(1)}`
              }))
            ]}
          />

          <Button
            variant={showUnlockedOnly ? 'primary' : 'ghost'}
            size="sm"
            icon={<CheckCircle size={16} />}
            onClick={onToggleUnlockedOnly}
          >
            Unlocked Only
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default AchievementFilters;
