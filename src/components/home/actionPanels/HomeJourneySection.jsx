import { TrendingUp } from 'lucide-react';

const HomeJourneySection = ({
  memberSinceLabel,
  userStats
}) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <TrendingUp className="mr-2" size={20} />
      Your Gaming Journey
    </h3>
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.max(0, Math.floor((userStats.totalPlayTime || 0) / 60))}
          </div>
          <div className="text-white/70 text-sm">Minutes Played</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {userStats.bestWinStreak || 0}
          </div>
          <div className="text-white/70 text-sm">Best Win Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {userStats.foodEaten || 0}
          </div>
          <div className="text-white/70 text-sm">Food Consumed</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-white/60 text-sm">
          Member since {memberSinceLabel}
        </p>
      </div>
    </div>
  </div>
);

export default HomeJourneySection;
