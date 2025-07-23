import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Button from './Button';

/**
 * Error Boundary Component for SnakrX
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('SnakrX Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Here you could send the error to a logging service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;
      
      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={48} className="text-red-400" />
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-white/70 mb-4">
                The snake got tangled up in some code! Don't worry, it happens to the best of us.
              </p>
              
              {/* Error ID for support */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                <p className="text-sm text-white/60">
                  Error ID: <span className="font-mono text-white/80">{this.state.errorId}</span>
                </p>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 text-left mb-4">
                  <summary className="text-red-400 cursor-pointer mb-2 font-medium">
                    Error Details (Development)
                  </summary>
                  <div className="text-xs text-white/70 font-mono space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-words">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button
                variant="primary"
                fullWidth
                onClick={this.handleRetry}
                icon={<RefreshCw size={18} />}
                className="mb-3"
              >
                Try Again
              </Button>
              
              <Button
                variant="ghost"
                fullWidth
                onClick={this.handleGoHome}
                icon={<Home size={18} />}
              >
                Go to Home
              </Button>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-white/50 text-sm mb-2">
                  Still having issues?
                </p>
                <a
                    href={`mailto:blessancorley@gmail.com?subject=SnakrX Error Report&body=Error ID: ${this.state.errorId}`}
                    className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                    >
                    Contact Support
                </a>


              </div>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error handling in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, clearError };
};

/**
 * Error Fallback Component for specific sections
 */
export const ErrorFallback = ({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description = "An error occurred while loading this section.",
  showDetails = false
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center p-8 bg-white/5 border border-white/10 rounded-xl"
  >
    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle size={32} className="text-red-400" />
    </div>
    
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/70 mb-4">{description}</p>
    
    {showDetails && error && (
      <details className="bg-red-500/10 border border-red-400/20 rounded-lg p-3 mb-4 text-left">
        <summary className="text-red-400 cursor-pointer text-sm">
          Error Details
        </summary>
        <pre className="mt-2 text-xs text-white/70 whitespace-pre-wrap break-words">
          {error.message}
        </pre>
      </details>
    )}
    
    {onRetry && (
      <Button
        variant="ghost-primary"
        onClick={onRetry}
        icon={<RefreshCw size={16} />}
      >
        Try Again
      </Button>
    )}
  </motion.div>
);

/**
 * Network Error Component
 */
export const NetworkError = ({ onRetry }) => (
  <ErrorFallback
    title="Connection Error"
    description="Unable to connect to the server. Please check your internet connection."
    onRetry={onRetry}
  />
);

/**
 * Not Found Error Component
 */
export const NotFoundError = ({ onGoHome }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center p-8"
  >
    <div className="text-8xl mb-4">🐍</div>
    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
    <p className="text-white/70 mb-6">
      The snake couldn't find what you're looking for!
    </p>
    <Button
      variant="primary"
      onClick={onGoHome || (() => window.location.href = '/')}
      icon={<Home size={18} />}
    >
      Back to Home
    </Button>
  </motion.div>
);

export default ErrorBoundary;