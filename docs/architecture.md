# Architecture

## Overview

SnakrX is a client-heavy React application backed by Firebase managed services.
The browser owns gameplay, rendering, local session state, and optimistic UI.
Firebase handles identity, persistence, file storage, server-side workflows, and scheduled aggregation jobs.

## Frontend

### App shell

- `src/main.jsx` bootstraps the Vite React app and PWA registration.
- `src/App.jsx` wires routes and provider composition.
- `src/components/layout/*` provides shared navigation, footer, and route shell pieces.

### State boundaries

- `src/hooks/useAuth.js` owns authentication state and user-profile hydration.
- `src/hooks/useAchievements.js` owns achievement unlock checks and collection flows.
- `src/hooks/useGame.js` orchestrates gameplay lifecycle, pause/resume, and persistence.
- `src/hooks/game/gameLogic.js` contains deterministic snake movement and collision logic.
- `src/hooks/game/progress.js` contains game-progress derivations such as tracked max length and food-event counters.
- `src/hooks/game/sessionPersistence.js` contains pure session/achievement/leaderboard stat builders used by `useGame`.

### UI and styling

- Tailwind CSS drives styling.
- Framer Motion is used for transitions and animated sections.
- React Router handles route-level composition.
- `react-hot-toast` is used for transient user feedback.

## Backend

There is no separate Express or Nest server.
Backend logic is implemented as Firebase Cloud Functions under `functions/`.

### Cloud Functions modules

- `functions/index.js` is a thin export layer.
- `functions/src/runtime.js` centralizes Firebase Admin initialization and runtime dependencies.
- `functions/src/shared/utils.js` contains shared validation, sanitization, email, and weekly-leaderboard helpers.
- `functions/src/otp.js` handles email OTP request and verification.
- `functions/src/support.js` handles support ticket submission and admin/customer update flows.
- `functions/src/avatar.js` handles avatar upload and deletion.
- `functions/src/leaderboards.js` handles leaderboard upserts, manual admin generation, and the scheduled weekly leaderboard job.

This split keeps the callable surface area stable while reducing the maintenance risk of the previous monolithic `functions/index.js`.

## Data and Firebase services

### Authentication

- Firebase Authentication is used for account identity.
- Email/password is the primary auth path.
- OTP verification is implemented with callable Cloud Functions before account completion.

### Firestore

Firestore stores user and product data including:

- `users`
- `publicProfiles`
- `games`
- `leaderboards`
- `weeklyLeaderboards`
- `achievements`
- `supportTickets`

Security rules live in `firestore.rules`.

### Storage

Firebase Storage stores profile avatars.
Storage rules live in `storage.rules`.

### Functions

Callable Functions are used for:

- OTP email delivery and verification
- support ticket creation and updates
- avatar upload/delete
- leaderboard submission
- weekly leaderboard generation

## Key runtime flows

### Game completion

1. `useGame` detects a terminal state and guards against duplicate persistence with a saved-session id set.
2. `gameOperations.saveGameSession` stores the raw session payload.
3. `updateUserStats` applies aggregate stat increments.
4. Achievement checks run against predicted post-game stats.
5. Leaderboard submission runs for score-bearing sessions and can trigger rank-based stat updates.

### Support flow

1. The support page submits a payload through `src/services/firebase/support.js`.
2. The callable support function persists a Firestore ticket.
3. Email notifications are sent to support and to the user when admins update a ticket.
4. Authenticated users subscribe to ticket updates from the client.

### Weekly leaderboard flow

1. Game sessions are stored in the `games` collection.
2. The scheduled function reads the previous ISO week window.
3. It aggregates per-board and overall weekly results.
4. It writes `weeklyLeaderboards` documents and updates user weekly-achievement stats.

## Testing and quality gates

- Unit and integration tests use Vitest and Testing Library.
- E2E flows use Playwright.
- `npm run test:coverage` enforces the repository coverage floor through `scripts/check-coverage.cjs`.
- GitHub Actions runs lint, tests, and build checks in CI.

## Current tradeoffs

- Gameplay remains client-authoritative, which keeps iteration speed high but is weaker for anti-cheat guarantees.
- Firebase reduces backend maintenance cost, but some server-side workflows are constrained by Firestore document/query patterns.
- A few large page-level files still exist and remain candidates for further decomposition.
