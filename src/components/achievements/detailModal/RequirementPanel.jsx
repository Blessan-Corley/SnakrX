import { getAchievementRequirementDetails } from '@/hooks/achievements/progress.js';
import { formatRequirementValue } from '@/components/achievements/achievementPageUtils.js';

const RequirementPanel = ({
  achievement,
  accentColor,
  userStats,
  heading = 'Requirements'
}) => {
  const requirementDetails = getAchievementRequirementDetails(achievement, userStats || {});
  if (!requirementDetails.length) return null;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-left">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3">{heading}</div>
      <div className="space-y-3">
        {requirementDetails.map((detail) => (
          <div key={`${achievement.id}-${detail.key}`} className="rounded-xl border border-white/8 bg-black/10 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/80">{detail.label}</span>
              <span
                className={`font-semibold ${detail.type === 'numeric' ? 'text-white' : 'text-white/70'}`}
                style={detail.type === 'numeric' ? { color: accentColor } : undefined}
              >
                {formatRequirementValue(detail)}
              </span>
            </div>
            {detail.type === 'numeric' && (
              <div className="mt-2">
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${detail.percentage}%`, backgroundColor: accentColor }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequirementPanel;
