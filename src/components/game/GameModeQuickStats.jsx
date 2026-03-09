import { StatsCard } from '@/components/ui/Card';
import { QUICK_STATS } from './gamePageConfig';

const GameModeQuickStats = ({ competitiveGames, competitiveWins, userStats, formatScore }) => (
  <div>
    <h3 className="text-2xl font-bold text-white text-center mb-6">Your Gaming Stats</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {QUICK_STATS.map(({ key, title, Icon, subtitle, getValue }) => (
        <StatsCard
          key={key}
          title={title}
          value={getValue({ competitiveGames, competitiveWins, formatScore, userStats })}
          icon={<Icon size={20} />}
          subtitle={subtitle}
        />
      ))}
    </div>
  </div>
);

export default GameModeQuickStats;
