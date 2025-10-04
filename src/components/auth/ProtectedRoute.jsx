import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, userProfile, loading, initialized } = useAuth(); // Use initialized state
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/landing" // Redirect to landing page instead of login
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check admin access if required
  const isAdmin = userProfile?.role === 'admin' || userProfile?.username === 'admin';
  if (adminOnly && !isAdmin) {
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

export default ProtectedRoute;
