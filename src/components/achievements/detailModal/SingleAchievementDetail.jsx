import { CheckCircle } from 'lucide-react';
import { getAchievementProgressSnapshot } from '@/hooks/achievements/progress.js';
import {
  defaultProgressSnapshot
} from '@/components/achievements/achievementPageUtils.js';
import RequirementPanel from './RequirementPanel.jsx';

const SingleAchievementDetail = ({
  calculateAchievementProgress,
  getTierStyling,
  isAchievementUnlocked,
  selectedSingleAchievement,
  userStats
}) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-white mb-2">{selectedSingleAchievement.title}</h3>
    <p className="text-white/70 mb-4 leading-relaxed">{selectedSingleAchievement.description}</p>
    {selectedSingleAchievement.mustDo && (
      <div className="bg-amber-500/10 border border-amber-400/25 rounded-lg p-3 mb-4 text-left">
        <div className="text-xs uppercase tracking-wide text-amber-300 mb-1">Must do</div>
        <div className="text-sm text-amber-100">{selectedSingleAchievement.mustDo}</div>
      </div>
    )}

    <div className="flex items-center justify-center space-x-4 mb-4">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        selectedSingleAchievement.tier === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
        selectedSingleAchievement.tier === 'epic' ? 'bg-purple-500/20 text-purple-300' :
        selectedSingleAchievement.tier === 'rare' ? 'bg-blue-500/20 text-blue-300' :
        selectedSingleAchievement.tier === 'uncommon' ? 'bg-emerald-500/20 text-emerald-300' :
        'bg-gray-500/20 text-gray-300'
      }`}>
        {selectedSingleAchievement.tier}
      </span>
      <span className="text-primary-400 font-bold">+{selectedSingleAchievement.points} points</span>
    </div>

    <RequirementPanel
      achievement={selectedSingleAchievement}
      accentColor={getTierStyling(selectedSingleAchievement.tier).color}
      userStats={userStats}
    />

    {isAchievementUnlocked(selectedSingleAchievement.id) ? (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
        <CheckCircle size={20} className="mx-auto mb-2 text-green-400" />
        <p className="text-green-400 font-medium">Achievement Unlocked!</p>
      </div>
    ) : (
      <div className="bg-white/5 rounded-lg p-3 mb-4">
        {(() => {
          const progressSnapshot = userStats
            ? getAchievementProgressSnapshot(selectedSingleAchievement, userStats)
            : defaultProgressSnapshot;
          const progress = userStats
            ? calculateAchievementProgress(selectedSingleAchievement, userStats)
            : 0;

          return (
            <>
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>{progressSnapshot.label}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-white/60 mt-2 text-right">
                {progressSnapshot.current}/{progressSnapshot.target}
              </div>
            </>
          );
        })()}
      </div>
    )}
  </div>
);

export default SingleAchievementDetail;
