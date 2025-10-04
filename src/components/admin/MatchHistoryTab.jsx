import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatScore, formatTime } from '@/utils/gameUtils';

/**
 * Admin Match History Tab Component
 */
export const MatchHistoryTab = ({ matchHistory, loading }) => {
  return (
    <div className="space-y-6">
      <Card variant="glass" padding="lg">
        <h2 className="text-xl font-bold text-white mb-6">Recent Match History</h2>

        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3">
            {matchHistory.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      match.result === 'victory' ? 'bg-green-400' :
                      match.result === 'defeat' ? 'bg-red-400' :
                      'bg-blue-400'
                    }`} />

                    <div>
                      <div className="font-semibold text-white">{match.username || 'Unknown Player'}</div>
                      <div className="text-sm text-white/60">
                        {match.mode} {match.difficulty && `(${match.difficulty})`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-bold text-white">{formatScore(match.score)}</div>
                      <div className="text-xs text-white/60">Score</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">{formatTime(match.duration)}</div>
                      <div className="text-xs text-white/60">Duration</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white/60">
                        {match.timestamp.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-white/50">
                        {match.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                {match.stats && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-white/60">Food Eaten:</span>
                        <span className="text-white ml-1">{match.foodEaten || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Max Speed:</span>
                        <span className="text-white ml-1">{match.speedReached || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Moves:</span>
                        <span className="text-white ml-1">{match.stats?.moves || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Efficiency:</span>
                        <span className="text-white ml-1">{match.stats?.efficiency?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
