import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth.js';
import { GameProvider } from './hooks/useGame.js';
import { AchievementProvider } from './hooks/useAchievements.js';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PublicRoute from './components/auth/PublicRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Lazy load components
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const GamePage = lazy(() => import('./pages/game/GamePage.jsx'));
const Game = lazy(() => import('./pages/game/Game.jsx'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage.jsx'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'));
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage.jsx'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <AchievementProvider>
            <Router 
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <div className="min-h-screen bg-gradient-dark text-white">
                <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: 'rgba(30, 41, 59, 0.95)', color: '#fff' } }} />
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                      <Route index element={<HomePage />} />
                      <Route path="home" element={<Navigate to="/" replace />} />
                      <Route path="game" element={<GamePage />} />
                      <Route path="game/:mode" element={<Game />} />
                      <Route path="game/:mode/:difficulty" element={<Game />} />
                      <Route path="game/:mode/:playerCount" element={<Game />} />
                      <Route path="leaderboard" element={<LeaderboardPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="achievements" element={<AchievementsPage />} />
                      <Route path="admin" element={<AdminPage />} />
                      <Route path="help" element={<HelpPage />} />
                      <Route path="privacy" element={<PrivacyPage />} />
                      <Route path="terms" element={<TermsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/landing" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </AchievementProvider>
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;