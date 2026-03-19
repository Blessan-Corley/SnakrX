# Admin Advanced Filtering Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add efficient advanced filtering, paging, and responsive interactions across admin users, match history, and support tickets.

**Architecture:** Extend the admin callable backend to accept normalized filter payloads and return paged filtered results, then update the admin controller and tab components to use draft filters, explicit apply/reset flows, and per-tab loading states. Keep overview stats separate and keep optimistic mutations instant.

**Tech Stack:** React, Firebase Functions callable APIs, Firestore-backed admin datasets, Vitest, ESLint.

---

## Chunk 1: Backend Query Contracts

### Task 1: Lock the backend admin filter helpers

**Files:**
- Modify: `F:\My Projects\SnakrX\functions\src\admin.js`
- Test: `F:\My Projects\SnakrX\functions\src\admin.test.js`

- [ ] **Step 1: Write failing helper tests for filter normalization and ticket pagination**
- [ ] **Step 2: Run `npm run test:run -- functions/src/admin.test.js` and confirm the new tests fail**
- [ ] **Step 3: Add pure helpers for page normalization, filter normalization, and pagination metadata**
- [ ] **Step 4: Re-run `npm run test:run -- functions/src/admin.test.js` and confirm those tests pass**

### Task 2: Add filter-aware admin users and games callables

**Files:**
- Modify: `F:\My Projects\SnakrX\functions\src\admin.js`
- Test: `F:\My Projects\SnakrX\functions\src\admin.test.js`

- [ ] **Step 1: Add failing tests for users filters and games filters**
- [ ] **Step 2: Run `npm run test:run -- functions/src/admin.test.js` and confirm the new tests fail**
- [ ] **Step 3: Implement `filters` support in `listAdminUsers` and `listAdminGames`**
- [ ] **Step 4: Re-run `npm run test:run -- functions/src/admin.test.js` and confirm the tests pass**

### Task 3: Add filter-aware support ticket admin callable

**Files:**
- Modify: `F:\My Projects\SnakrX\functions\src\admin.js`
- Test: `F:\My Projects\SnakrX\functions\src\admin.test.js`

- [ ] **Step 1: Write a failing test for `listAdminSupportTickets({ page, limit, filters })`**
- [ ] **Step 2: Run `npm run test:run -- functions/src/admin.test.js` and confirm failure**
- [ ] **Step 3: Implement the callable and export it through the functions entrypoint**
- [ ] **Step 4: Re-run `npm run test:run -- functions/src/admin.test.js`**

## Chunk 2: Frontend Admin Services

### Task 4: Update admin service payloads and contracts

**Files:**
- Modify: `F:\My Projects\SnakrX\src\services\firebase\admin.js`
- Test: `F:\My Projects\SnakrX\src\services\firebase\admin.test.js`

- [ ] **Step 1: Add failing tests for filtered users, filtered games, and filtered tickets payloads**
- [ ] **Step 2: Run `npm run test:run -- src/services/firebase/admin.test.js` and confirm failure**
- [ ] **Step 3: Implement service methods returning paged results with `filters`**
- [ ] **Step 4: Re-run `npm run test:run -- src/services/firebase/admin.test.js`**

## Chunk 3: Admin Filter UI

### Task 5: Add reusable admin filter controls

**Files:**
- Create: `F:\My Projects\SnakrX\src\components\admin\AdminFilterBar.jsx`
- Create: `F:\My Projects\SnakrX\src\components\admin\AdminFilterBar.test.jsx`
- Modify: `F:\My Projects\SnakrX\src\components\admin\index.js`

- [ ] **Step 1: Write failing tests for apply/reset rendering and callback behavior**
- [ ] **Step 2: Run `npm run test:run -- src/components/admin/AdminFilterBar.test.jsx`**
- [ ] **Step 3: Implement the reusable filter bar**
- [ ] **Step 4: Re-run `npm run test:run -- src/components/admin/AdminFilterBar.test.jsx`**

### Task 6: Add users filter controls and pagination integration

**Files:**
- Modify: `F:\My Projects\SnakrX\src\components\admin\UsersTab.jsx`
- Modify: `F:\My Projects\SnakrX\src\components\admin\UsersTab.test.jsx`

- [ ] **Step 1: Add failing tests for users filter apply/reset behavior**
- [ ] **Step 2: Run `npm run test:run -- src/components/admin/UsersTab.test.jsx`**
- [ ] **Step 3: Implement users filter UI using the shared filter bar**
- [ ] **Step 4: Re-run `npm run test:run -- src/components/admin/UsersTab.test.jsx`**

### Task 7: Add match history filter controls and pagination integration

**Files:**
- Modify: `F:\My Projects\SnakrX\src\components\admin\MatchHistoryTab.jsx`
- Modify: `F:\My Projects\SnakrX\src\components\admin\MatchHistoryTab.test.jsx`

- [ ] **Step 1: Add failing tests for mode/result/range filter interactions**
- [ ] **Step 2: Run `npm run test:run -- src/components/admin/MatchHistoryTab.test.jsx`**
- [ ] **Step 3: Implement match history advanced filters**
- [ ] **Step 4: Re-run `npm run test:run -- src/components/admin/MatchHistoryTab.test.jsx`**

### Task 8: Add support ticket advanced filter controls

**Files:**
- Modify: `F:\My Projects\SnakrX\src\components\admin\SupportTicketsTab.jsx`
- Modify: `F:\My Projects\SnakrX\src\components\admin\SupportTicketsTab.test.jsx`

- [ ] **Step 1: Add failing tests for status/priority/unread/date filtering**
- [ ] **Step 2: Run `npm run test:run -- src/components/admin/SupportTicketsTab.test.jsx`**
- [ ] **Step 3: Implement the advanced support ticket filter surface**
- [ ] **Step 4: Re-run `npm run test:run -- src/components/admin/SupportTicketsTab.test.jsx`**

## Chunk 4: Admin Controller Integration

### Task 9: Add draft filter state and apply/reset flows to the admin controller

**Files:**
- Modify: `F:\My Projects\SnakrX\src\pages\admin\useAdminDataController.js`
- Modify: `F:\My Projects\SnakrX\src\pages\admin\AdminPage.jsx`
- Test: `F:\My Projects\SnakrX\src\pages\admin\AdminPage.test.jsx`

- [ ] **Step 1: Add failing integration tests for tab-specific filter state and page reset behavior**
- [ ] **Step 2: Run `cmd /c npx vitest run --pool forks src/pages/admin/AdminPage.test.jsx`**
- [ ] **Step 3: Implement per-tab draft filters, apply/reset handlers, and filtered fetch calls**
- [ ] **Step 4: Re-run `cmd /c npx vitest run --pool forks src/pages/admin/AdminPage.test.jsx`**

### Task 10: Keep optimistic actions stable under active filters

**Files:**
- Modify: `F:\My Projects\SnakrX\src\pages\admin\useAdminDataController.js`
- Test: `F:\My Projects\SnakrX\src\components\admin\UsersTab.test.jsx`
- Test: `F:\My Projects\SnakrX\src\components\admin\SupportTicketsTab.test.jsx`

- [ ] **Step 1: Add failing tests covering moderation and ticket save while filters are active**
- [ ] **Step 2: Run the targeted admin tab tests**
- [ ] **Step 3: Adjust optimistic state handling to preserve filtered views**
- [ ] **Step 4: Re-run the targeted admin tab tests**

## Chunk 5: Verification

### Task 11: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm run test:run -- functions/src/admin.test.js src/services/firebase/admin.test.js`**
- [ ] **Step 2: Run `npm run test:run -- src/components/admin/AdminFilterBar.test.jsx src/components/admin/UsersTab.test.jsx src/components/admin/MatchHistoryTab.test.jsx src/components/admin/SupportTicketsTab.test.jsx`**
- [ ] **Step 3: Run `cmd /c npx vitest run --pool forks src/pages/admin/AdminPage.test.jsx`**
- [ ] **Step 4: Run `npm run lint -- src/services/firebase/admin.js src/services/firebase/admin.test.js src/components/admin/AdminFilterBar.jsx src/components/admin/AdminFilterBar.test.jsx src/components/admin/UsersTab.jsx src/components/admin/UsersTab.test.jsx src/components/admin/MatchHistoryTab.jsx src/components/admin/MatchHistoryTab.test.jsx src/components/admin/SupportTicketsTab.jsx src/components/admin/SupportTicketsTab.test.jsx src/pages/admin/useAdminDataController.js src/pages/admin/AdminPage.jsx functions/src/admin.js functions/src/admin.test.js`**

