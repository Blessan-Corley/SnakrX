import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, userProfile, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check admin access if required
  if (adminOnly && userProfile && !isAdmin(userProfile)) {
    return (
      <Navigate 
        to="/" 
        replace 
      />
    );
  }

  // Render children if authenticated
  return children;
};

/**
 * Public Route Component
 * Redirects to home if user is already authenticated
 */
export const PublicRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();

  // Show loading spinner while checking authentication
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Render children if not authenticated
  return children;
};

/**
 * Admin Route Component
 * Only accessible by admin users
 */
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute adminOnly={true}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Helper function to check if user is admin
 */
const isAdmin = (userProfile) => {
  return userProfile?.role === 'admin' || 
         userProfile?.username === 'admin' ||
         userProfile?.email === 'admin@snakrx.com';
};

export default ProtectedRoute;