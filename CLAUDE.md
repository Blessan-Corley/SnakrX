# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build with Vite + Terser
npm run preview  # Preview production build
npm run lint     # ESLint with React rules
```

## Project Architecture

### Core Structure
- **React 18.2 + Vite 5.0** - Modern React with fast dev server and optimized builds
- **Firebase Integration** - Authentication (Auth), Firestore (database), and offline persistence
- **Tailwind CSS + Framer Motion** - Styling and animations
- **Context-based State Management** - Custom hooks for game, auth, and achievements

### Key Directories & Patterns

#### `/src/hooks/` - Custom React Hooks with Context
- `useGame.js` - **Main game state management** with optimized performance and responsive controls
- `useAuth.js` - Firebase authentication with rate limiting and user stats
- `useAchievements.js` - Achievement tracking and unlock system
- Each hook has modular subdirectories (e.g., `hooks/game/`, `hooks/auth/`) for separation of concerns

#### `/src/services/firebase/` - Firebase Backend Layer
- `config.js` - Firebase initialization with validation and error handling
- `game.js` - Game session operations and leaderboards
- `leaderboard.js` - Global and mode-specific rankings
- `firestore.js` - Database operations with offline support

#### `/src/utils/` - Core Game Logic
- `gameUtils.js` - **Central game mechanics**: directions, modes, scoring, speed calculations
- `aiPathfinding.js` - AI opponent logic with difficulty levels
- `sound.js` - Audio effects management
- `logger.js` - Structured logging for debugging

#### `/src/pages/` - Route Components
- Lazy-loaded in `App.jsx` with React Suspense
- Protected routes use `ProtectedRoute` wrapper
- Game routes support dynamic parameters: `/game/:mode/:difficulty`

#### Game Architecture
- **Game Modes**: Classic, Classic Transparent, VS AI, Multiplayer (up to 4 players)
- **Performance Optimized**: 60 FPS gameplay with efficient React state management
- **Responsive Controls**: Keyboard (WASD/Arrows), mobile touch support, multiplayer controls
- **Real-time Features**: Firebase leaderboards, achievement unlocking, user profiles

### Firebase Configuration
- Environment variables required: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.
- See `src/services/firebase/config.js` for validation logic and setup instructions
- Offline persistence enabled for better UX

### Vite Configuration
- Path aliases configured: `@components`, `@hooks`, `@services`, etc.
- JSX handling optimized for both `.js` and `.jsx` files
- Development server on port 3000 with automatic browser opening

### Code Style & Standards
- ESLint with React hooks and refresh rules
- Component-based architecture with clear separation of concerns
- Error boundaries for graceful error handling
- Toast notifications for user feedback

### Important Files to Understand
- `src/App.jsx` - **Main routing and provider setup** with lazy loading
- `src/hooks/useGame.js` - **Core game logic** and state management
- `src/utils/gameUtils.js` - Game constants and utility functions
- `src/services/firebase/config.js` - Firebase setup with validation