import { motion } from 'framer-motion';
import { Award, CalendarDays, Gamepad2, Monitor, RefreshCw, Search, Trophy, Users, Zap } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { GAME_MODES_FILTERS } from './leaderboardConfig.js';

const iconMap = {
  classic: <Gamepad2 size={16} />,
  transparent: <Monitor size={16} />,
  vsai: <Zap size={16} />,
  multiplayer: <Users size={16} />,
  overall: <Trophy size={16} />,
  weekly: <CalendarDays size={16} />,
  achievements: <Award size={16} />
};

const LeaderboardFiltersSection = ({
  selectedMode,
  searchTerm,
  loading,
  onModeSelect,
  onSearchTermChange,
  onRefresh
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
    <Card variant="glass" padding="md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {GAME_MODES_FILTERS.map((mode) => (
            <Button
              key={mode.id}
              variant={selectedMode === mode.id ? 'primary' : 'ghost'}
              size="sm"
              icon={iconMap[mode.icon]}
              onClick={() => onModeSelect(mode.id)}
            >
              {mode.name}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm w-full md:w-48"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading} aria-label="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default LeaderboardFiltersSection;
