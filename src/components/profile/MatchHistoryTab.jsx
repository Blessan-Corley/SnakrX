import { Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatScore, formatTime } from '@/utils/gameUtils';

/**
 * Profile Match History Tab Component
 */
export const MatchHistoryTab = ({ mockMatchHistory }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Match History</h2>

      <div className="space-y-4">
        {mockMatchHistory.map((match) => (
          <Card key={match.id} variant="glass" padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  match.result === 'victory' ? 'bg-green-400' :
                  match.result === 'defeat' ? 'bg-red-400' :
                  'bg-blue-400'
                }`} />
                <div>
                  <div className="font-semibold text-white">{match.mode}</div>
                  <div className="text-sm text-white/60">
                    {match.date.toLocaleDateString()} - {match.date.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="font-bold text-white">{formatScore(match.score)}</div>
                  <div className="text-sm text-white/60">Score</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{formatTime(match.time)}</div>
                  <div className="text-sm text-white/60">Time</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-300">+{match.xpGained || 0} XP</div>
                  <div className="text-sm text-white/60">XP Gained</div>
                </div>
                <div className={`text-right font-medium ${
                  match.result === 'victory' ? 'text-green-400' :
                  match.result === 'defeat' ? 'text-red-400' :
                  'text-white'
                }`}>
                  {match.result === 'victory' ? 'Victory' :
                   match.result === 'defeat' ? 'Defeat' :
                   'Completed'}
                </div>
              </div>
            </div>

            {match.achievements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <Award size={14} className="text-primary-400" />
                  <span className="text-sm text-white/70">Achievements:</span>
                  <div className="flex flex-wrap gap-1">
                    {match.achievements.map((achievement, index) => (
                      <span key={index} className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
