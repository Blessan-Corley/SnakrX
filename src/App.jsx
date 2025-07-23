import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import { GameProvider } from '@/hooks/useGame';
import { AchievementProvider } from '@/hooks/useAchievements';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Lazy load components for better performance
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const GamePage = lazy(() => import('@/pages/game/GamePage'));
const ClassicGame = lazy(() => import('@/pages/game/ClassicGame'));
const VSAIGame = lazy(() => import('@/pages/game/VSAIGame'));
const MultiplayerGame = lazy(() => import('@/pages/game/MultiplayerGame'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));

/**
 * Main App Component
 * Handles routing, providers, and global app structure
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <AchievementProvider>
            <Router>
              <div className="min-h-screen bg-gradient-dark text-white">
                {/* Global loading and error notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(30, 41, 59, 0.95)',
                      color: '#fff',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />

                {/* Application Routes */}
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Public Routes - Only accessible when not authenticated */}
                    <Route path="/landing" element={
                      <PublicRoute>
                        <LandingPage />
                      </PublicRoute>
                    } />
                    
                    <Route path="/login" element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    } />
                    
                    <Route path="/register" element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    } />
                    
                    <Route path="/forgot-password" element={
                      <PublicRoute>
                        <ForgotPasswordPage />
                      </PublicRoute>
                    } />

                    {/* Protected Routes - Require authentication */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
                      {/* Main app routes wrapped in layout */}
                      <Route index element={<HomePage />} />
                      <Route path="home" element={<Navigate to="/" replace />} />
                      
                      {/* Game Routes */}
                      <Route path="game" element={<GamePage />} />
                      <Route path="game/classic" element={<ClassicGame />} />
                      <Route path="game/vsai/:difficulty" element={<VSAIGame />} />
                      <Route path="game/multiplayer/:playerCount" element={<MultiplayerGame />} />
                      
                      {/* Feature Routes */}
                      <Route path="leaderboard" element={<LeaderboardPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="achievements" element={<AchievementsPage />} />
                      <Route path="admin" element={<AdminPage />} />
                      
                      {/* Info Routes */}
                      <Route path="help" element={<HelpPage />} />
                      <Route path="privacy" element={<PrivacyPage />} />
                      <Route path="terms" element={<TermsPage />} />
                    </Route>

                    {/* Fallback Routes */}
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