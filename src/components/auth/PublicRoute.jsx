import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Public Route Component
 * Redirects authenticated users away from auth pages (login, register, etc.)
 */
const PublicRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();

  // Show loading spinner while authentication is being checked
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // If user is authenticated, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, render the public component
  return children;
};

export default PublicRoute;