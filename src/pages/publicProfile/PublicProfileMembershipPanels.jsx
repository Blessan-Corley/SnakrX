import { CalendarClock, Medal } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatDateTime } from './publicProfileUtils.js';

const PublicProfileMembershipPanels = ({
  createdAtDate,
  membershipSummary,
  lastActiveDate,
  xpProgress,
  mostPlayedMode
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <Card variant="glass" padding="md">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white/80">
          <CalendarClock size={16} />
          <span className="text-sm">Member Since</span>
        </div>
        <p className="text-white font-semibold">{createdAtDate ? createdAtDate.toLocaleDateString() : 'Unknown'}</p>
        <p className="text-white/60 text-sm">Playing for: {membershipSummary || 'Unknown'}</p>
        <p className="text-white/60 text-sm">Last active: {formatDateTime(lastActiveDate)}</p>
      </div>
    </Card>

    <Card variant="glass" padding="md">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white/80">
          <Medal size={16} />
          <span className="text-sm">Progress</span>
        </div>
        <p className="text-white font-semibold">Level {xpProgress.level}</p>
        <p className="text-white/60 text-sm">
          {xpProgress.isMaxLevel ? 'Max level reached' : `${xpProgress.xpNeededForNext} XP to next level`}
        </p>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${xpProgress.progressPercent}%` }}
          />
        </div>
        <p className="text-white/50 text-xs">
          {xpProgress.xpIntoLevel}/{Math.max(1, xpProgress.nextLevelXp - xpProgress.currentLevelXp)} XP in this level
        </p>
        <p className="text-white/60 text-sm">
          Most played: {mostPlayedMode.label}
        </p>
      </div>
    </Card>
  </div>
);

export default PublicProfileMembershipPanels;
