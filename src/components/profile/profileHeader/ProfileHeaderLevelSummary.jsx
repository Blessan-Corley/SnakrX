import { Crown } from 'lucide-react';

const ProfileHeaderLevelSummary = ({
  currentLevelScore,
  isMaxLevel,
  levelProgress,
  nextLevelScore,
  playerLevel,
  totalXp,
  xpNeededForNext
}) => (
  <div className="text-center md:text-right">
    <div className="flex items-center justify-center md:justify-end space-y-1">
      <div className="flex items-center space-x-2 mb-2">
        <Crown size={24} className="text-amber-400 fill-amber-400/20" />
        <span className="text-2xl font-bold text-white">Level {playerLevel}</span>
      </div>
    </div>
    <div className="w-48 bg-black/30 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/5">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 relative"
        style={{ width: `${Math.min(100, levelProgress)}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
      </div>
    </div>
    <p className="text-white/60 text-xs mt-2 font-mono">
      {isMaxLevel
        ? `Max level reached (${playerLevel})`
        : `${xpNeededForNext} XP to next level`}
    </p>
    <p className="text-white/50 text-xs mt-1 font-mono">
      XP: {totalXp} ({Math.max(0, totalXp - currentLevelScore)}/{Math.max(1, nextLevelScore - currentLevelScore)})
    </p>
  </div>
);

export default ProfileHeaderLevelSummary;
