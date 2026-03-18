import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PublicRoute from './components/auth/PublicRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import ScrollTopButton from './components/layout/ScrollTopButton.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import AppProviders from './AppProviders.jsx';

// Direct imports for critical auth pages to avoid lazy loading issues
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Lazy load other components
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const GamePage = lazy(() => import('./pages/game/GamePage.jsx'));
const Game = lazy(() => import('./pages/game/Game.jsx'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const FriendsPage = lazy(() => import('./pages/FriendsPage.jsx'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage.jsx'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage.jsx'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'));
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage.jsx'));
const SupportPage = lazy(() => import('./pages/legal/SupportPage.jsx'));

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ScrollToTop />
          <ScrollTopButton />
          <div className="min-h-screen bg-gradient-dark text-white">
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: 'rgba(30, 41, 59, 0.95)', color: '#fff' } }} />
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Routes>
                <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route index element={<HomePage />} />
                  <Route path="home" element={<Navigate to="/" replace />} />
                  <Route path="game" element={<GamePage />} />
                  <Route path="game/:mode" element={<Game />} />
                  <Route path="game/:mode/:difficulty" element={<Game />} />
                  <Route path="game/:mode/:playerCount" element={<Game />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="friends" element={<FriendsPage />} />
                  <Route path="player/:userId" element={<PublicProfilePage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                  <Route path="help" element={<HelpPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/landing" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
