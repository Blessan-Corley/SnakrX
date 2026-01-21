import { motion } from 'framer-motion';
import { AlertTriangle, Bug, Home, Mail, Phone, RefreshCw } from 'lucide-react';
import Button from '../Button.jsx';

const DefaultErrorView = ({
  error,
  errorInfo,
  errorId,
  errorMessage,
  errorType,
  onGoHome,
  onReportBug,
  onRetry
}) => {
  const ErrorIcon = errorMessage.icon;

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-28 h-28 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <div className="text-5xl">
              <ErrorIcon size={48} />
            </div>
          </div>
        </motion.div>

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

          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Bug size={16} className={errorMessage.color} />
              <span className="text-sm font-medium text-white/80">Error Details</span>
            </div>
            <p className="text-sm text-white/60">
              Error ID: <span className="font-mono text-white/80">{errorId}</span>
            </p>
            <p className="text-sm text-white/60">
              Type: <span className="font-mono text-white/80 capitalize">{errorType}</span>
            </p>
          </div>

          {import.meta.env.DEV && error && (
            <details className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 text-left mb-6">
              <summary className="text-red-400 cursor-pointer mb-3 font-medium flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                Error Details (Development Mode)
              </summary>
              <div className="text-xs text-white/70 font-mono space-y-3">
                <div>
                  <strong className="text-red-300">Error Message:</strong>
                  <div className="mt-1 p-2 bg-black/20 rounded border">
                    {error.message}
                  </div>
                </div>
                <div>
                  <strong className="text-red-300">Stack Trace:</strong>
                  <pre className="mt-1 p-2 bg-black/20 rounded border whitespace-pre-wrap break-words text-xs max-h-40 overflow-y-auto">
                    {error.stack}
                  </pre>
                </div>
                {errorInfo && (
                  <div>
                    <strong className="text-red-300">Component Stack:</strong>
                    <pre className="mt-1 p-2 bg-black/20 rounded border whitespace-pre-wrap break-words text-xs max-h-32 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={onRetry}
              icon={<RefreshCw size={18} />}
              fullWidth
            >
              Try Again
            </Button>

            <Button
              variant="ghost"
              onClick={onGoHome}
              icon={<Home size={18} />}
              fullWidth
            >
              Go Home
            </Button>
          </div>

          <Button
            variant="ghost-primary"
            onClick={onReportBug}
            icon={<Mail size={18} />}
            fullWidth
          >
            Report Bug via Email
          </Button>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm mb-3">
              Need help? Our support team is here for you!
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Mail size={14} className="text-primary-400" />
                <span className="text-white/70">snakrxgame@gmail.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-primary-400">
                  <Phone size={16} />
                </span>
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
};

export default DefaultErrorView;
