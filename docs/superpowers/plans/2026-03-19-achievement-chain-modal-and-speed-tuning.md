# Achievement Chain Modal And Speed Tuning Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the chain achievement modal into a clearer, consistent detail surface and retune game speed so solo and competitive modes use appropriate, profile-based progression.

**Architecture:** Keep the modal shell intact and redesign the chain detail body in place. Replace flat speed tuning with mode-family profiles in shared game utilities so gameplay state and HUD state continue to derive from the same logic.

**Tech Stack:** React, Framer Motion, Vitest, Tailwind utility classes, shared game utility helpers.

---

## File Map

- Modify: `src/components/achievements/detailModal/ChainAchievementDetail.jsx`
- Modify: `src/components/achievements/AchievementDetailModal.jsx`
- Modify: `src/utils/game/constants.js`
- Modify: `src/utils/game/speed.js`
- Modify: `src/hooks/game/tickEngine/stateUpdates.js`
- Modify: `src/hooks/useGame.js`
- Test: `src/components/achievements/achievementViewState.test.js` or a new achievement detail modal test file if needed
- Test: `src/utils/gameUtils.test.js`
- Test: `src/hooks/game/gameTickEngine.test.js`

## Chunk 1: Speed Profiles

### Task 1: Add failing utility tests for mode-aware speed profiles

**Files:**
- Modify: `src/utils/gameUtils.test.js`

- [ ] **Step 1: Write the failing test**

Add tests that expect:
- solo modes and competitive modes to use different speed ramps
- `vsai` and `multiplayer` to share the same competitive curve
- milestone and level helpers to respect the selected profile

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/utils/gameUtils.test.js`
Expected: FAIL because current helpers use one global curve.

- [ ] **Step 3: Write minimal implementation**

Update:
- `src/utils/game/constants.js`
- `src/utils/game/speed.js`

Add profile-aware speed helpers without changing unrelated game logic.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/utils/gameUtils.test.js`
Expected: PASS

### Task 2: Add failing tick-engine regression for competitive speed application

**Files:**
- Modify: `src/hooks/game/gameTickEngine.test.js`
- Modify: `src/hooks/game/tickEngine/stateUpdates.js`

- [ ] **Step 1: Write the failing test**

Add a test that verifies a competitive-mode state update recalculates speed using the competitive profile.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/hooks/game/gameTickEngine.test.js`
Expected: FAIL because the runtime speed still uses the flat curve.

- [ ] **Step 3: Write minimal implementation**

Update the tick-state speed calculation to pass mode and difficulty through the profile-aware helper.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/hooks/game/gameTickEngine.test.js`
Expected: PASS

## Chunk 2: Derived Game HUD State

### Task 3: Keep HUD-derived speed state aligned with runtime speed

**Files:**
- Modify: `src/hooks/useGame.js`

- [ ] **Step 1: Write the failing test**

If existing coverage is insufficient, add or extend a test to confirm speed level and next milestone reflect the same mode-aware profile used by runtime speed.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/utils/gameUtils.test.js src/hooks/game/gameTickEngine.test.js`
Expected: FAIL until derived helpers are wired consistently.

- [ ] **Step 3: Write minimal implementation**

Update `src/hooks/useGame.js` to use the same profile-aware helper input for level and milestone calculations.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/utils/gameUtils.test.js src/hooks/game/gameTickEngine.test.js`
Expected: PASS

## Chunk 3: Chain Modal Redesign

### Task 4: Add failing UI test coverage for the chain detail layout

**Files:**
- Create or Modify: achievement detail modal test file under `src/components/achievements/`

- [ ] **Step 1: Write the failing test**

Add a render test that expects the chain detail view to show:
- compact chain progress summary
- inline previous/next tier controls
- tier rail or stepper inside the card
- requirement block and optional must-do content in a stable vertical order

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- <achievement-detail-test-file>`
Expected: FAIL because the current layout does not expose the new structure.

- [ ] **Step 3: Write minimal implementation**

Update:
- `src/components/achievements/detailModal/ChainAchievementDetail.jsx`
- `src/components/achievements/AchievementDetailModal.jsx` if wrapper spacing needs adjustment

Implement the redesigned hierarchy without changing the single-achievement detail flow.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- <achievement-detail-test-file>`
Expected: PASS

## Chunk 4: Verification

### Task 5: Run the focused verification suite

**Files:**
- No code changes expected

- [ ] **Step 1: Run targeted tests**

Run:
- `npm run test:run -- src/utils/gameUtils.test.js src/hooks/game/gameTickEngine.test.js <achievement-detail-test-file>`

Expected: PASS

- [ ] **Step 2: Run lint on changed files**

Run:
- `npm run lint -- src/components/achievements/detailModal/ChainAchievementDetail.jsx src/components/achievements/AchievementDetailModal.jsx src/utils/game/constants.js src/utils/game/speed.js src/hooks/game/tickEngine/stateUpdates.js src/hooks/useGame.js <achievement-detail-test-file>`

Expected: PASS
