# Admin Advanced Filtering Design

**Date:** 2026-03-19

## Goal

Upgrade the admin panel so users, match history, and support tickets all support efficient advanced filtering, bounded result sets, responsive interactions, and scalable query behavior instead of relying on oversized client-side lists.

## Current Problems

### Users

- Admin users currently load a large batch and then filter only on the client.
- Search is limited to the currently loaded page-sized memory set rather than true server results.
- Moderation actions can feel slower than necessary because list loading, stats loading, and actions are tightly coupled.

### Match history

- Match history currently loads only a recent slice with no advanced query support.
- There is no way to filter by mode, result, score band, or date window from the admin UI.
- The admin page must fetch a general batch before the operator can narrow down what they need.

### Support tickets

- Support tickets currently use a live window and local filtering only.
- That is acceptable for the current inbox-sized surface, but it does not support historical filtered browsing in a consistent admin query model.
- Ticket interactions should stay responsive and optimistic even when the filtered view changes.

## Design Decisions

### Query model

- Every admin area gets a server-filtered query path.
- Every query returns a stable result contract:
  - `items`
  - `pagination`
  - optional tab-specific metadata
- Keep the existing page and limit contract for this repo instead of mixing cursor and offset conventions in the frontend.
- Backend pagination is applied after filtering so page results remain correct.

### Users filters

- Search text across:
  - `username`
  - `displayName`
  - `email`
- `role`
- `banned` state
- activity window:
  - all
  - active today
  - active this week
  - inactive this week
- sort:
  - newest
  - last active
  - best score
  - total games

### Match history filters

- player text search:
  - `username`
  - `userId`
- `mode`
- `result`
- score range:
  - min
  - max
- date range:
  - from
  - to
- sort:
  - newest
  - highest score
  - longest duration

### Support ticket filters

- search text across:
  - ticket id
  - title
  - display name
  - username
  - email
- `status`
- `priority`
- unread-only / player-needs-update state
- date range:
  - from
  - to
- sort:
  - newest
  - oldest
  - recently updated

### UX behavior

- Each admin tab gets its own filter bar and its own loading state.
- Filter editing is draft-based:
  - change controls locally
  - click `Apply` to fetch
  - click `Reset` to clear
- Applying or resetting filters resets the page back to `1`.
- Mutations remain optimistic:
  - ban/unban updates instantly
  - ticket save updates instantly
- Dashboard overview remains independent so stats can load quickly even when tab data is filtered or paged.

## Architecture

### Backend

- Extend `functions/src/admin.js` with filter-aware callables:
  - `listAdminUsers({ page, limit, filters })`
  - `listAdminGames({ page, limit, filters })`
  - `listAdminSupportTickets({ page, limit, filters })`
  - keep `getAdminOverview()` as a separate summary path
- Reuse existing sanitization helpers.
- Keep server result mapping centralized in `functions/src/admin.js`.
- Add small pure helpers for:
  - filter normalization
  - item matching
  - pagination metadata

### Frontend services

- Extend `src/services/firebase/admin.js` to match the new callable payloads and return contracts.
- Keep one thin client service function per admin query.
- Preserve callable memoization to avoid recreation overhead.

### Frontend controller

- Extend `src/pages/admin/useAdminDataController.js` with:
  - one filter state per tab
  - one draft filter state per tab
  - one fetch method per tab
  - page state per tab
  - per-area loading state
- Keep overview loading separate from tab data loading.

### Frontend components

- Add reusable admin filter UI pieces instead of hand-building every filter row.
- Users tab and match history tab should stay compact and scan-friendly.
- Support tickets should keep the recent live experience for the latest bounded window, but filtered browsing should use the server query path when filters go beyond the live inbox slice.

## Error Handling And Safety

- Unknown filter values are normalized to safe defaults.
- Empty or invalid numeric range fields are ignored instead of throwing.
- Date filters tolerate missing endpoints.
- Filter application must never break admin actions:
  - moderation
  - ticket save
  - manual refresh
- Empty results should render as a clear “no results for current filters” state instead of a blank panel.

## Testing Strategy

### Backend

- Add helper tests for:
  - filter normalization
  - pagination metadata
  - matching logic
- Add callable-level tests for users, games, and ticket filters.

### Frontend services

- Verify request payloads include page, limit, and filters.
- Verify the new paginated result shape is preserved.

### Frontend UI

- Verify each tab:
  - applies filters
  - resets filters
  - pages forward and backward
  - shows empty states correctly
- Verify optimistic ticket and moderation actions still work while filters are active.

## Out Of Scope

- Rebuilding the admin visual language from scratch.
- True full-dataset realtime subscriptions for users and games.
- Assignment workflows, comments, or audit trails for admin tickets.
