import { Component } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, Home, Bug, Mail, ExternalLink } from 'lucide-react';
import Button from './Button';

/**
 * Enhanced Error Boundary Component for SnakrX
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error) {
    // Determine error type for better messaging
    let errorType = 'unknown';
    if (error.message?.includes('forEach')) {
      errorType = 'array';
    } else if (error.message?.includes('Firebase')) {
      errorType = 'firebase';
    } else if (error.message?.includes('Network')) {
      errorType = 'network';
    } else if (error.message?.includes('import') || error.message?.includes('module')) {
      errorType = 'import';
    }

    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
      errorType
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console with more details
    console.group('🐍 SnakrX Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Stack:', error.stack);
    console.groupEnd();
    
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
      errorId: null,
      errorType: 'unknown'
    });
    
    // Force a page reload for critical errors
    if (this.state.errorType === 'import' || this.state.errorType === 'firebase') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      errorType: this.state.errorType,
      message: this.state.error?.message || 'Unknown error',
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const emailBody = `Hi SnakrX Team,

I encountered an error while playing SnakrX. Here are the details:

Error ID: ${errorDetails.errorId}
Error Type: ${errorDetails.errorType}
Error Message: ${errorDetails.message}
Page URL: ${errorDetails.url}
Time: ${errorDetails.timestamp}
Browser: ${errorDetails.userAgent}

Additional context:
[Please describe what you were doing when the error occurred]

Thanks!`;

    const mailtoUrl = `mailto:blessancorley@gmail.com?subject=SnakrX Bug Report - ${errorDetails.errorType}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  getErrorMessage = () => {
    switch (this.state.errorType) {
      case 'array':
        return {
          title: 'Game Data Error',
          description: 'There was an issue with the game data. This usually fixes itself by restarting the game.',
          icon: '🎮',
          color: 'text-blue-400'
        };
      case 'firebase':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to game servers. Please check your internet connection and try again.',
          icon: '🔗',
          color: 'text-orange-400'
        };
      case 'network':
        return {
          title: 'Network Error',
          description: 'Network connection failed. Please check your internet connection.',
          icon: '📡',
          color: 'text-red-400'
        };
      case 'import':
        return {
          title: 'Loading Error',
          description: 'Failed to load game components. Refreshing the page should fix this.',
          icon: '📦',
          color: 'text-purple-400'
        };
      default:
        return {
          title: 'Unexpected Error',
          description: 'Something unexpected happened. Don\'t worry, it happens to the best of us!',
          icon: '🐍',
          color: 'text-red-400'
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;
      const errorMessage = this.getErrorMessage();
      
      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
            onReportBug={this.handleReportBug}
          />
        );
      }

      // Enhanced default error UI
      return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-28 h-28 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <div className="text-5xl">{errorMessage.icon}</div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Oops! {errorMessage.title}
              </h1>
              <p className="text-white/80 mb-6 text-lg leading-relaxed">
                {errorMessage.description}
              </p>
              
              {/* Error ID for support */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Bug size={16} className={errorMessage.color} />
                  <span className="text-sm font-medium text-white/80">Error Details</span>
                </div>
                <p className="text-sm text-white/60">
                  Error ID: <span className="font-mono text-white/80">{this.state.errorId}</span>
                </p>
                <p className="text-sm text-white/60">
                  Type: <span className="font-mono text-white/80 capitalize">{this.state.errorType}</span>
                </p>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 text-left mb-6">
                  <summary className="text-red-400 cursor-pointer mb-3 font-medium flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    Error Details (Development Mode)
                  </summary>
                  <div className="text-xs text-white/70 font-mono space-y-3">
                    <div>
                      <strong className="text-red-300">Error Message:</strong>
                      <div className="mt-1 p-2 bg-black/20 rounded border">
                        {this.state.error.message}
                      </div>
                    </div>
                    <div>
                      <strong className="text-red-300">Stack Trace:</strong>
                      <pre className="mt-1 p-2 bg-black/20 rounded border whitespace-pre-wrap break-words text-xs max-h-40 overflow-y-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong className="text-red-300">Component Stack:</strong>
                        <pre className="mt-1 p-2 bg-black/20 rounded border whitespace-pre-wrap break-words text-xs max-h-32 overflow-y-auto">
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
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  icon={<RefreshCw size={18} />}
                  fullWidth
                >
                  Try Again
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={this.handleGoHome}
                  icon={<Home size={18} />}
                  fullWidth
                >
                  Go Home
                </Button>
              </div>

              {/* Report Bug Button */}
              <Button
                variant="ghost-primary"
                onClick={this.handleReportBug}
                icon={<Mail size={18} />}
                fullWidth
              >
                Report Bug via Email
              </Button>

              {/* Support Information */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/60 text-sm mb-3">
                  Need help? Our support team is here for you!
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Mail size={14} className="text-primary-400" />
                    <span className="text-white/70">blessancorley@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-primary-400">📞</span>
                    <span className="text-white/70">+91 9976768211</span>
                  </div>
                </div>
                
                <p className="text-white/50 text-xs mt-3">
                  Issues are typically resolved within 24 hours
                </p>
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
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center p-8 bg-white/5 border border-white/10 rounded-xl"
  >
    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle size={32} className="text-red-400" />
    </div>
    
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/70 mb-4">{description}</p>
    
    {showDetails && error && (
      <details className="bg-red-500/10 border border-red-400/20 rounded-lg p-3 mb-4 text-left">
        <summary className="text-red-400 cursor-pointer text-sm flex items-center">
          <Bug size={14} className="mr-2" />
          Error Details
        </summary>
        <pre className="mt-2 text-xs text-white/70 whitespace-pre-wrap break-words bg-black/20 p-2 rounded">
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
 * Game Error Component - Specific for game crashes
 */
export const GameError = ({ onRetry, onRestart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl"
  >
    <div className="text-6xl mb-4">🐍💥</div>
    <h3 className="text-xl font-semibold text-white mb-2">Game Crashed!</h3>
    <p className="text-white/70 mb-6">
      The snake got tangled up in some code! Don't worry, we can fix this.
    </p>
    
    <div className="flex space-x-3 justify-center">
      <Button
        variant="primary"
        onClick={onRestart}
        icon={<RefreshCw size={16} />}
      >
        Restart Game
      </Button>
      <Button
        variant="ghost"
        onClick={onRetry}
        icon={<Home size={16} />}
      >
        Back to Menu
      </Button>
    </div>
  </motion.div>
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
    <div className="text-8xl mb-6">🐍❓</div>
    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
    <p className="text-white/70 mb-8 text-lg">
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