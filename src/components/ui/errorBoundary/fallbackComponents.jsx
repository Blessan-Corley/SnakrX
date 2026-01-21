import { motion } from 'framer-motion';
import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import Button from '../Button.jsx';

export const ErrorFallback = ({
  error,
  onRetry,
  title = 'Something went wrong',
  description = 'An error occurred while loading this section.',
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

export const NetworkError = ({ onRetry }) => (
  <ErrorFallback
    title="Connection Error"
    description="Unable to connect to the server. Please check your internet connection."
    onRetry={onRetry}
  />
);

export const GameError = ({ onRetry, onRestart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl"
  >
    <div className="flex items-center justify-center text-6xl mb-4 text-white">
      <Bug size={48} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">Game Crashed!</h3>
    <p className="text-white/70 mb-6">
      The snake got tangled up in some code! Don&apos;t worry, we can fix this.
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

export const NotFoundError = ({ onGoHome }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center p-8"
  >
    <div className="flex items-center justify-center text-8xl mb-6 text-white">
      <AlertTriangle size={64} />
    </div>
    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
    <p className="text-white/70 mb-8 text-lg">
      The snake couldn&apos;t find what you&apos;re looking for!
    </p>
    <Button
      variant="primary"
      onClick={onGoHome || (() => { window.location.href = '/'; })}
      icon={<Home size={18} />}
    >
      Back to Home
    </Button>
  </motion.div>
);
