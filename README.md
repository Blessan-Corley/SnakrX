# SnakrX

SnakrX is a product-style web application built around a multi-mode snake game.

It is not only a game screen. The project includes authentication, user profiles, public profiles, achievements, leaderboards, friends, support tickets, admin workflows, PWA support, automated tests, and CI.

The gameplay runs in the browser, but the app also uses Firebase services and Cloud Functions for backend-owned workflows such as OTP verification, support operations, avatar handling, leaderboard updates, and persisted game-session finalization.

## What This Project Covers

### Gameplay
- Classic mode
- Transparent mode
- VS AI with difficulty levels
- Local multiplayer
- Bonus food and game progression systems

### Product Features
- Email/password authentication
- OTP-based email verification
- User profile and public profile pages
- Match history and achievement tracking
- Global and weekly leaderboards
- Friends and social profile surfaces
- Support ticket submission and ticket history
- Admin tools for support workflows and moderation
- PWA installability and cached assets

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Framer Motion

### Backend and Infrastructure
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Firebase Hosting

### Testing and Quality
- Vitest
- Testing Library
- Playwright
- ESLint
- GitHub Actions

## Architecture Summary

### Frontend responsibilities
- Render the game and product UI
- Run the game loop locally in the browser
- Manage page state through hooks and feature modules
- Call Firebase SDKs and callable Cloud Functions

### Backend responsibilities
- Generate and verify OTP codes
- Finalize trusted game-session writes and primary stat updates
- Create and update leaderboard records
- Handle avatar upload and deletion workflows
- Process support ticket creation and admin ticket updates
- Enforce access through Firestore and Storage rules

### Data model highlights
Firestore stores:
- users
- publicProfiles
- games
- leaderboards
- weeklyLeaderboards
- supportTickets
- friends and friend requests

## Why Firebase Was Used

Firebase was used as the backend platform, but this project is not frontend-only.

What I implemented on the backend side:
- Cloud Functions for OTP email delivery and verification
- Cloud Functions for support ticket submission and admin updates
- Cloud Functions for avatar lifecycle and Storage coordination
- Cloud Functions for leaderboard maintenance and weekly leaderboard generation
- Cloud Functions for persisted game-session finalization and stat updates
- Firestore rules and Storage rules to restrict direct client writes
- Data shaping and validation logic for trusted backend flows

What Firebase handled for me:
- authentication infrastructure
- managed database and storage
- serverless function hosting
- deployment plumbing

So the backend work here is real application-backend work, but it is platform-backed rather than a custom Node/Express server.

## What This Project Is and Is Not

This project is:
- a full web product built around a game
- a frontend-heavy full-stack project
- a good example of product engineering with managed backend services

This project is not:
- a server-authoritative multiplayer system
- a low-level backend or distributed systems project
- only a landing page plus one game component

## Repository Structure

- `src/pages` route-level pages
- `src/components` reusable UI and feature components
- `src/hooks` stateful product logic
- `src/services/firebase` Firebase client access and service helpers
- `src/utils` gameplay and shared utility logic
- `functions` Firebase Cloud Functions
- `e2e` Playwright end-to-end tests
- `docs` architecture and deployment notes

## Local Setup

### Prerequisites
- Node.js 20
- npm
- a Firebase project with web app credentials

### Install
```bash
npm install
npm ci --prefix functions
```

### Environment
1. Copy `.env.example` to `.env`
2. Fill in the `VITE_FIREBASE_*` values
3. If you need OTP or support email flows locally, copy `functions/.env.example` to `functions/.env`

Optional for authenticated Playwright flows:
- `E2E_EMAIL`
- `E2E_PASSWORD`

### Run locally
```bash
npm run dev
```

Default local app URL:
- `http://localhost:3000`

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:run
npm run test:coverage
npm run test:e2e
npm run e2e:public
npm run e2e:auth
npm run ci:quality
npm run check:deploy-env
```

## Quality Checks

Typical validation flow:

```bash
npm run lint
npm run test:run
npm run build
```

Stricter validation:

```bash
npm run test:coverage
npm run test:e2e
```

## Deployment Notes

Production deploy:

```bash
firebase deploy --project <your-project-id> --only firestore:rules,firestore:indexes,storage,functions,hosting
```

Important notes:
- keep `.firebaserc` local and use `.firebaserc.example` as a template
- deploy Cloud Functions before expecting persisted game sessions, OTP, support, or leaderboard writes to work
- Cloud Functions in production do not read your local `functions/.env`
- configure `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `SUPPORT_EMAIL_TO`, and `OTP_SALT` in the deployed Functions environment

## Testing and Project Health

This repository includes:
- unit and integration tests for frontend behavior and Firebase client services
- direct tests for backend helper logic in Cloud Functions
- Playwright coverage for public and authenticated browser flows
- CI for lint, tests, coverage, and build verification

## Known Tradeoffs

- gameplay is client-executed, not fully server-authoritative
- Firebase provides the backend platform, so this project emphasizes product delivery and application logic over custom infrastructure
- the strongest engineering depth is in frontend architecture and product workflows, not backend systems design

## Docs

- `docs/architecture.md`
- `docs/deployment-readiness.md`
- `docs/production-deployment.md`

## License

MIT
