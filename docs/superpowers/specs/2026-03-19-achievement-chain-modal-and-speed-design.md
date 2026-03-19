# Achievement Chain Modal And Speed Tuning Design

**Date:** 2026-03-19

## Goal

Fix the achievement chain detail modal so it reads as one coherent surface instead of a modal containing a competing floating card, and retune game speed so solo modes remain readable while competitive modes ramp sooner and keep every snake moving at the same speed.

## Current Problems

### Chain achievement modal

- The active chain tier card has too many competing decorative layers.
- The previous and next buttons sit outside the main composition, which makes the card feel detached from the modal.
- Progress, requirements, status, and tier navigation compete for attention instead of forming a clear reading order.
- The chain modal feels inconsistent with the cleaner single-achievement detail view.

### Speed tuning

- Speed progression is currently based on one flat global curve.
- The current curve makes higher-score classic runs feel too slow for too long.
- Competitive modes need faster shared pressure, but still need predictable fairness.
- HUD speed state and actual gameplay speed must continue to derive from the same source.

## Design Decisions

### Chain modal redesign

- Keep the existing modal shell and title so the achievements experience remains consistent with the rest of the app.
- Redesign only the chain detail body.
- Replace the detached left-right control layout with a single centered content stack.
- Move chain-level progress into a compact summary panel under the chain heading.
- Rebuild the active tier section as a single main card with restrained accent styling:
  - one soft glow
  - one border treatment
  - no oversized decorative corner overlay
- Keep tier navigation inside the card by using a tier rail and inline previous/next controls.
- Preserve the existing requirement and must-do information, but place them below the main progress block in a clearer hierarchy.
- Keep the single-achievement detail view mostly unchanged.

### Speed tuning redesign

- Replace the flat speed config with mode-family speed profiles.
- Solo profile:
  - used by `classic` and `classic_transparent`
  - smoother early ramp
  - stronger mid-run acceleration than today
  - still tuned for longer, readable sessions
- Competitive profile:
  - used by `vsai` and `multiplayer`
  - earlier pressure than solo
  - one shared curve for the full match
  - player and opponent snakes always move on the same tick cadence
- Keep bonus-food points contributing to speed progress through food-equivalent conversion.
- Keep speed HUD values, next milestone, and actual tick speed all driven from the same profile-aware progress calculation.

## Architecture

### Achievement modal

- Update `src/components/achievements/detailModal/ChainAchievementDetail.jsx` as the main layout change.
- Keep `src/components/achievements/AchievementDetailModal.jsx` as the stable wrapper.
- Reuse `RequirementPanel.jsx` rather than introducing a second requirements pattern.
- Avoid broad modal framework changes unless the redesign requires a small wrapper-class adjustment.

### Speed system

- Extend `src/utils/game/constants.js` with mode-aware speed profiles.
- Move speed calculations in `src/utils/game/speed.js` to profile-aware helpers.
- Keep `src/hooks/game/tickEngine/stateUpdates.js` responsible for updating actual runtime speed from the shared helper.
- Keep `src/hooks/useGame.js` responsible for exposing derived UI state from the same helper set.

## Error Handling And Safety

- Unknown mode values fall back to the solo profile-safe defaults rather than throwing.
- Missing difficulty data must not break speed conversion.
- Chain modal rendering must tolerate missing optional tier fields such as `mustDo` and missing `nextTier`.

## Testing Strategy

### Achievement modal

- Add render-level tests that verify the chain detail view presents:
  - chain progress summary
  - inline tier navigation
  - active tier progress
  - tier requirement block
- Confirm the redesign does not break the single-achievement view.

### Speed tuning

- Add tests that prove solo and competitive profiles produce different ramps.
- Add tests that prove competitive modes still use one shared speed value for the match.
- Keep regression coverage for bonus-food-driven speed progress.

## Out Of Scope

- Reworking the standalone achievement detail view beyond consistency touch-ups.
- Changing AI decision logic or per-difficulty AI strategy behavior.
- Server-side achievement unlock/collect architecture changes.
