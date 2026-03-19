# Match History XP Gain Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the XP earned from each match everywhere match history is presented, including profile-facing history and the admin history list.

**Architecture:** Compute XP authoritatively during backend game finalization and persist it on each game record for all new matches. For older matches that do not have `xpGained` stored, derive the same value from the existing game fields when building admin/public/profile history view models so the UI remains accurate without a migration.

**Tech Stack:** React, Vite, Vitest, Firebase callable functions, Firestore

---

## Chunk 1: Data Pipeline

### Task 1: Cover server-side match XP mapping with tests

**Files:**
- Modify: `functions/src/games.test.js`
- Modify: `functions/src/admin.test.js`

- [ ] **Step 1: Write failing tests for public/admin game mapping**

Add tests that expect:
- public recent game payloads expose `xpGained`
- admin recent game payloads expose `xpGained`
- legacy records without stored `xpGained` fall back to the deterministic XP formula

- [ ] **Step 2: Run targeted tests to verify they fail**

Run: `npm run test:run -- functions/src/games.test.js functions/src/admin.test.js`
Expected: FAIL on missing `xpGained`

- [ ] **Step 3: Implement minimal backend mapping/persistence**

Update backend game finalization and list mappers so:
- `finalizeGameSession` stores `xpGained` on the game document
- `mapPublicGame` returns `xpGained`, falling back to recalculation for legacy records
- `mapAdminGame` returns `xpGained`, falling back to recalculation for legacy records

- [ ] **Step 4: Re-run targeted tests**

Run: `npm run test:run -- functions/src/games.test.js functions/src/admin.test.js`
Expected: PASS

## Chunk 2: Client View Models

### Task 2: Cover client-side history mapping with tests

**Files:**
- Modify: `src/pages/publicProfile/publicProfileUtils.test.js`
- Modify: `src/pages/ProfilePage.jsx`

- [ ] **Step 1: Write failing tests for history mapping**

Add tests that expect:
- `mapGamesToHistory` includes `xpGained`
- local profile history mapping preserves stored `xpGained` and computes a fallback for legacy records

- [ ] **Step 2: Run targeted tests to verify they fail**

Run: `npm run test:run -- src/pages/publicProfile/publicProfileUtils.test.js`
Expected: FAIL on missing `xpGained`

- [ ] **Step 3: Implement minimal client mapping**

Update the client history mappers to include `xpGained` with the same fallback strategy used by the backend.

- [ ] **Step 4: Re-run targeted tests**

Run: `npm run test:run -- src/pages/publicProfile/publicProfileUtils.test.js`
Expected: PASS

## Chunk 3: UI Presentation

### Task 3: Add failing UI tests for XP display

**Files:**
- Modify: `src/components/admin/MatchHistoryTab.test.jsx`
- Create: `src/components/profile/MatchHistoryTab.test.jsx`
- Modify: `src/pages/PublicProfilePage.test.jsx`

- [ ] **Step 1: Write failing UI tests**

Add tests that expect:
- admin match history shows a clear XP-earned value
- signed-in profile match history shows a clear XP-earned value
- public profile recent matches show a clear XP-earned value

- [ ] **Step 2: Run targeted tests to verify they fail**

Run: `npm run test:run -- src/components/admin/MatchHistoryTab.test.jsx src/components/profile/MatchHistoryTab.test.jsx src/pages/PublicProfilePage.test.jsx`
Expected: FAIL on missing XP text

- [ ] **Step 3: Implement minimal UI updates**

Update history UIs to render the match XP consistently and cleanly, keeping existing score/time/result hierarchy intact.

- [ ] **Step 4: Re-run targeted tests**

Run: `npm run test:run -- src/components/admin/MatchHistoryTab.test.jsx src/components/profile/MatchHistoryTab.test.jsx src/pages/PublicProfilePage.test.jsx`
Expected: PASS

## Chunk 4: Final Verification

### Task 4: Verify the integrated change set

**Files:**
- Modify: `functions/src/games.js`
- Modify: `functions/src/admin.js`
- Modify: `src/pages/publicProfile/publicProfileUtils.js`
- Modify: `src/pages/ProfilePage.jsx`
- Modify: `src/pages/publicProfile/PublicProfileRecentMatches.jsx`
- Modify: `src/components/profile/MatchHistoryTab.jsx`
- Modify: `src/components/profile/OverviewTab.jsx`
- Modify: `src/components/admin/MatchHistoryTab.jsx`

- [ ] **Step 1: Run focused test suite**

Run: `npm run test:run -- functions/src/games.test.js functions/src/admin.test.js src/pages/publicProfile/publicProfileUtils.test.js src/components/admin/MatchHistoryTab.test.jsx src/components/profile/MatchHistoryTab.test.jsx src/pages/PublicProfilePage.test.jsx`
Expected: PASS

- [ ] **Step 2: Run lint on touched files or full repo**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Summarize verification evidence before claiming completion**

Report which commands passed and call out any remaining gaps.
