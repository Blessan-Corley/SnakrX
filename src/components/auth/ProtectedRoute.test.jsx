import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute.jsx';

const authState = {
  user: null,
  userProfile: null,
  loading: false,
  initialized: true
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState
}));

vi.mock('@/components/ui/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>
}));

const LandingProbe = () => {
  const location = useLocation();
  return <div>{location.state?.from || 'no-from-state'}</div>;
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.user = null;
    authState.userProfile = null;
    authState.loading = false;
    authState.initialized = true;
  });

  it('preserves search params and hash when redirecting unauthenticated users', () => {
    render(
      <MemoryRouter
        initialEntries={['/profile?tab=settings#security']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            )}
          />
          <Route path="/landing" element={<LandingProbe />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('/profile?tab=settings#security')).toBeInTheDocument();
  });

  it('renders children when the user is authenticated', () => {
    authState.user = { uid: 'user-1' };

    render(
      <MemoryRouter
        initialEntries={['/profile']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            )}
          />
          <Route path="/landing" element={<LandingProbe />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
