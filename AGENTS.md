# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the application code.
- `src/components/` holds reusable UI components.
- `src/pages/` includes route-level screens, wired in `src/App.jsx`.
- `src/hooks/` provides context-based hooks (game, auth, achievements).
- `src/services/firebase/` contains Firebase setup and data access.
- `src/utils/` hosts core game logic and helpers.
- `src/styles/` stores Tailwind and shared styles.
- `src/test/` includes Vitest setup and test utilities.
- `e2e/` contains Playwright tests.
- `dist/` is the production build output (generated).

## Build, Test, and Development Commands
- `npm run dev`: start Vite dev server on `http://localhost:3000`.
- `npm run build`: production build with Vite.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across the repo.
- `npm run test`: run Vitest in watch mode.
- `npm run test:run`: run Vitest once (CI-friendly).
- `npm run test:coverage`: enforce coverage thresholds.
- `npm run test:e2e`: run Playwright tests (expects `preview` on `4173`).

## Coding Style & Naming Conventions
- Use 2-space indentation and semicolons, matching existing files.
- React components use `.jsx` in `src/`.
- Keep hooks in `src/hooks/` and name with `useX` (e.g., `useGame.js`).
- Prefer existing path aliases like `@components` and `@utils`.
- Linting uses ESLint with React rules; fix warnings before pushing.

## Testing Guidelines
- Unit and integration tests use Vitest with `jsdom`.
- Test files follow `*.test.js` (example: `src/achievements.test.js`).
- Coverage thresholds are 63% for branches, 53% for functions, and 44% for lines/statements.
- E2E tests live in `e2e/` and run via Playwright.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commit prefixes seen in history:
  `feat:`, `fix:`, `chore:`, `ui:`.
- PRs should include a clear summary, testing notes, and screenshots for UI changes.
- Link related issues or tasks if applicable.

## Configuration & Environment
- Copy `.env.example` to `.env` and set `VITE_FIREBASE_*` keys.
- Firebase setup and validation live in `src/services/firebase/config.js`.
