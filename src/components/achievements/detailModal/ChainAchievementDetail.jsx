import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import { getIconComponent } from '@/utils/iconMap.js';
import { getTierStatusCopy } from '@/components/achievements/achievementPageUtils.js';
import RequirementPanel from './RequirementPanel.jsx';

const ChainAchievementDetail = ({
  chainTransitionDirection,
  getTierStyling,
  navigateChainTier,
  selectedChain,
  selectedChainTier,
  selectedChainTierIndex,
  selectedChainTierProgress,
  selectedChainTierStyling,
  userStats
}) => (
  <div className="space-y-3">
    <h3 className="text-lg sm:text-[1.15rem] font-bold text-white">{selectedChain.chainTitle}</h3>
    <p className="mx-auto max-w-[26rem] text-sm text-white/65 leading-relaxed">
      {selectedChain.chainDescription}
    </p>

    <div className="mx-auto w-full max-w-[24.75rem] bg-white/5 rounded-xl border border-white/10 px-3 py-2.5">
      <div className="flex justify-between text-[12px] text-white/75 mb-1.5">
        <span>Chain Progress</span>
        <span>{selectedChain.progressLabel}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: `${selectedChain.progressPercent}%`,
            backgroundColor: selectedChainTierStyling.color
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/45 mt-1.5">
        <span>{selectedChain.progressPercent}% complete</span>
        <span>
          {selectedChain.nextTier?.title && !selectedChain.nextTier.isUnlocked
            ? `Next target: ${selectedChain.nextTier.title}`
            : 'Chain complete'}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
      {selectedChainTierIndex > 0 ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous tier"
          onClick={() => navigateChainTier(selectedChainTierIndex - 1)}
          icon={<ChevronLeft size={18} />}
          className="h-10 w-10 shrink-0 rounded-2xl border border-white/15 bg-white/5"
          style={{
            borderColor: `${selectedChainTierStyling.color}55`,
            color: selectedChainTierStyling.color,
            boxShadow: `0 0 24px ${selectedChainTierStyling.color}18`
          }}
        />
      ) : (
        <div className="h-10 w-10 shrink-0" aria-hidden="true" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChainTier?.id}
          initial={{ opacity: 0, x: chainTransitionDirection > 0 ? 18 : -18, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: chainTransitionDirection > 0 ? -18 : 18, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-[18.75rem] sm:max-w-[22.25rem] overflow-hidden rounded-[1.2rem] border p-3.5 sm:p-4 text-left"
          style={{
            borderColor: `${selectedChainTierStyling.color}88`,
            background: `linear-gradient(155deg, ${selectedChainTierStyling.color}22, rgba(15, 23, 42, 0.88) 48%, rgba(15, 23, 42, 0.96))`,
            boxShadow: `0 0 0 1px ${selectedChainTierStyling.color}30, 0 18px 42px ${selectedChainTierStyling.color}24`
          }}
        >
          <div
            className="absolute -top-12 -right-10 h-28 w-28 rounded-full blur-3xl opacity-45"
            style={{ backgroundColor: selectedChainTierStyling.color }}
          />
          <div
            className="absolute top-0 right-0 h-20 w-20 rounded-bl-[2.75rem] border-l border-b"
            style={{
              borderColor: `${selectedChainTierStyling.color}66`,
              background: `linear-gradient(135deg, ${selectedChainTierStyling.color}55, transparent 72%)`
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-2.5 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border"
                  style={{
                    borderColor: `${selectedChainTierStyling.color}88`,
                    backgroundColor: `${selectedChainTierStyling.color}18`,
                    color: selectedChainTierStyling.color
                  }}
                >
                  {(() => {
                    const TierIcon = getIconComponent(selectedChainTier.icon);
                    return <TierIcon size={20} />;
                  })()}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/42 mb-1">
                    Tier {selectedChainTierIndex + 1} of {selectedChain.tiers.length}
                  </div>
                  <h4 className="text-lg sm:text-[1.25rem] font-bold text-white leading-tight break-words">
                    {selectedChainTier.title}
                  </h4>
                  <div className="text-[13px] mt-0.5" style={{ color: selectedChainTierStyling.color }}>
                    {selectedChainTier.tier} / +{selectedChainTier.points} points
                  </div>
                </div>
              </div>

              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${getTierStatusCopy(selectedChainTier).className}`}>
                {getTierStatusCopy(selectedChainTier).label}
              </span>
            </div>

            <p className="text-[13px] sm:text-sm text-white/72 leading-relaxed mb-2.5">
              {selectedChainTier.description}
            </p>

            <div className="bg-black/15 border border-white/10 rounded-[1rem] p-3 mb-2.5">
              <div className="flex items-center justify-between text-[13px] text-white/75 mb-1.5">
                <span>{selectedChainTierProgress.label}</span>
                <span>
                  {selectedChainTier.isUnlocked ? 'Completed' : `${selectedChainTierProgress.percentage}%`}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedChainTier.isUnlocked ? 100 : selectedChainTierProgress.percentage}%`,
                    backgroundColor: selectedChainTierStyling.color
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/55 mt-1.5">
                <span>
                  {selectedChainTier.isUnlocked ? 'Target met' : `${selectedChainTierProgress.current}/${selectedChainTierProgress.target}`}
                </span>
                <span>{selectedChainTier.requirements ? 'Current tier progress' : 'No progress tracked'}</span>
              </div>
            </div>

            <RequirementPanel
              achievement={selectedChainTier}
              accentColor={selectedChainTierStyling.color}
              userStats={userStats}
              heading="Tier requirements"
            />

            {selectedChainTier.mustDo && (
              <div className="mt-2.5 bg-amber-500/10 border border-amber-400/25 rounded-xl p-3 text-left">
                <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-1.5">Must do</div>
                <div className="text-[13px] text-amber-100 leading-relaxed">{selectedChainTier.mustDo}</div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap gap-2">
                {selectedChain.tiers.map((tierAchievement, index) => (
                  <button
                    key={tierAchievement.id}
                    type="button"
                    aria-label={`View ${tierAchievement.title}`}
                    onClick={() => navigateChainTier(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${index === selectedChainTierIndex ? 'w-10' : 'w-2.5'}`}
                    style={{
                      backgroundColor: index === selectedChainTierIndex
                        ? selectedChainTierStyling.color
                        : tierAchievement.isUnlocked
                          ? `${getTierStyling(tierAchievement.tier).color}99`
                          : 'rgba(255,255,255,0.18)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {selectedChainTierIndex < selectedChain.tiers.length - 1 ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next tier"
          onClick={() => navigateChainTier(selectedChainTierIndex + 1)}
          icon={<ChevronRight size={18} />}
          className="h-10 w-10 shrink-0 rounded-2xl border border-white/15 bg-white/5"
          style={{
            borderColor: `${selectedChainTierStyling.color}55`,
            color: selectedChainTierStyling.color,
            boxShadow: `0 0 24px ${selectedChainTierStyling.color}18`
          }}
        />
      ) : (
        <div className="h-10 w-10 shrink-0" aria-hidden="true" />
      )}
    </div>
  </div>
);

export default ChainAchievementDetail;
