import { Clock3 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatScore, formatTime } from '@/utils/gameUtils';

const PublicProfileRecentMatches = ({ history }) => (
  <Card variant="glass" padding="lg">
    <h2 className="text-lg font-bold text-white mb-4">Recent Matches</h2>
    {history.length === 0 ? (
      <p className="text-white/60">No recent games yet.</p>
    ) : (
      <div className="space-y-3">
        {history.map((match) => (
          <div key={match.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
            <div>
              <p className="text-white font-medium">{match.mode}</p>
              <p className="text-white/50 text-xs flex items-center gap-1">
                <Clock3 size={12} />
                {match.date.toLocaleDateString()} - {match.date.toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">{formatScore(match.score)}</p>
              <p className="text-white/50 text-xs">{formatTime(match.time)}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

export default PublicProfileRecentMatches;
