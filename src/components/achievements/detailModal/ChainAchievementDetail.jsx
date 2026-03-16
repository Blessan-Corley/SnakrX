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
}) => {
  const TierIcon = getIconComponent(selectedChainTier.icon);
  const tierStatus = getTierStatusCopy(selectedChainTier);
  const isFirstTier = selectedChainTierIndex === 0;
  const isLastTier = selectedChainTierIndex === selectedChain.tiers.length - 1;

  return (
    <div className="space-y-2.5 text-left">
      <div className="space-y-1 text-center">
        <h3 className="text-[1.25rem] sm:text-[1.35rem] font-bold text-white">{selectedChain.chainTitle}</h3>
        <p className="mx-auto max-w-[34rem] text-[13px] text-white/65 leading-relaxed">
          {selectedChain.chainDescription}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={selectedChainTier?.id}
          initial={{ opacity: 0, x: chainTransitionDirection > 0 ? 18 : -18, scale: 0.99 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: chainTransitionDirection > 0 ? -18 : 18, scale: 0.99 }}
          transition={{ duration: 0.22 }}
          className="relative mx-auto w-full max-w-[36rem] overflow-hidden rounded-[1.5rem] border p-3.5 sm:p-4"
          style={{
            borderColor: `${selectedChainTierStyling.color}66`,
            background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(15, 23, 42, 0.92) 26%, rgba(15, 23, 42, 0.97) 100%)`,
            boxShadow: `0 0 0 1px ${selectedChainTierStyling.color}22, 0 22px 48px ${selectedChainTierStyling.color}16`
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-12 top-0 h-24 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: selectedChainTierStyling.color }}
          />

          <div className="relative z-10 space-y-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2.5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Active tier</div>
                <div className="mt-1 text-[13px] font-semibold text-white/75">
                  Tier {selectedChainTierIndex + 1} of {selectedChain.tiers.length}
                </div>
                <div className="mt-1 text-[11px] text-white/50">
                  {selectedChain.nextTier?.title && !selectedChain.nextTier.isUnlocked
                    ? `Next target: ${selectedChain.nextTier.title}`
                    : `${selectedChain.progressLabel} tiers unlocked`}
                </div>
              </div>

              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${tierStatus.className}`}>
                {tierStatus.label}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] border"
                style={{
                  borderColor: `${selectedChainTierStyling.color}88`,
                  backgroundColor: `${selectedChainTierStyling.color}18`,
                  color: selectedChainTierStyling.color
                }}
              >
                <TierIcon size={18} />
              </div>

              <div className="min-w-0">
                <h4 className="text-[1.25rem] sm:text-[1.45rem] font-bold text-white leading-tight break-words">
                  {selectedChainTier.title}
                </h4>
                <div className="mt-0.5 text-[13px] font-semibold" style={{ color: selectedChainTierStyling.color }}>
                  {selectedChainTier.tier} / +{selectedChainTier.points} points
                </div>
                <p className="mt-1.5 text-[13px] text-white/72 leading-relaxed">
                  {selectedChainTier.description}
                </p>
              </div>
            </div>

            <div className="rounded-[1.1rem] border border-white/10 bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3 text-[13px] text-white/78">
                <span>{selectedChainTierProgress.label}</span>
                <span>
                  {selectedChainTier.isUnlocked ? 'Completed' : `${selectedChainTierProgress.percentage}%`}
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${selectedChainTier.isUnlocked ? 100 : selectedChainTierProgress.percentage}%`,
                    backgroundColor: selectedChainTierStyling.color
                  }}
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-white/55">
                <span>
                  {selectedChainTier.isUnlocked ? 'Target met' : `${selectedChainTierProgress.current}/${selectedChainTierProgress.target}`}
                </span>
                <span>{selectedChainTier.requirements ? 'Current tier progress' : 'No progress tracked'}</span>
              </div>
            </div>

            <nav
              aria-label="Chain tiers"
              className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Tier journey</div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Previous tier"
                    onClick={() => navigateChainTier(selectedChainTierIndex - 1)}
                    disabled={isFirstTier}
                    icon={<ChevronLeft size={18} />}
                    className="h-8 w-8 shrink-0 rounded-xl border border-white/15 bg-white/5"
                    style={{
                      borderColor: `${selectedChainTierStyling.color}55`,
                      color: selectedChainTierStyling.color
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Next tier"
                    onClick={() => navigateChainTier(selectedChainTierIndex + 1)}
                    disabled={isLastTier}
                    icon={<ChevronRight size={18} />}
                    className="h-8 w-8 shrink-0 rounded-xl border border-white/15 bg-white/5"
                    style={{
                      borderColor: `${selectedChainTierStyling.color}55`,
                      color: selectedChainTierStyling.color
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {selectedChain.tiers.map((tierAchievement, index) => {
                  const tierAccent = getTierStyling(tierAchievement.tier).color;
                  const isActiveTier = index === selectedChainTierIndex;

                  return (
                    <button
                      key={tierAchievement.id}
                      type="button"
                      aria-label={`Go to ${tierAchievement.title}`}
                      onClick={() => navigateChainTier(index)}
                      className="flex h-7 min-w-7 items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                      style={{
                        borderColor: isActiveTier ? `${selectedChainTierStyling.color}88` : 'rgba(255,255,255,0.12)',
                        backgroundColor: isActiveTier
                          ? `${selectedChainTierStyling.color}16`
                          : tierAchievement.isUnlocked
                            ? `${tierAccent}12`
                            : 'rgba(255,255,255,0.03)'
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{ color: isActiveTier || tierAchievement.isUnlocked ? '#ffffff' : 'rgba(255,255,255,0.72)' }}
                      >
                        {index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <RequirementPanel
              achievement={selectedChainTier}
              accentColor={selectedChainTierStyling.color}
              compact
              userStats={userStats}
              heading="Tier requirements"
            />

            {selectedChainTier.mustDo && (
              <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-2.5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-1">Must do</div>
                <div className="text-[13px] text-amber-100 leading-relaxed">{selectedChainTier.mustDo}</div>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default ChainAchievementDetail;
