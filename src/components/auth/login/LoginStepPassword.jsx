import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';

const LoginStepPassword = ({
  error,
  identifier,
  loading,
  onBack,
  onKeyPress,
  onPasswordChange,
  onToggleShowPassword,
  password,
  showPassword,
  validationError
}) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h2 className="text-xl font-semibold text-white mb-2">
        Enter Password
      </h2>
      <p className="text-white/70 text-sm">
        Welcome back, {identifier.includes('@') ? identifier.split('@')[0] : identifier}
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">
        Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-white/40" />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          onKeyPress={onKeyPress}
          className={`
            block w-full pl-10 pr-12 py-3 border rounded-xl
            bg-white/5 border-white/20 text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
            transition-all duration-200
            ${validationError ? 'border-red-400 focus:ring-red-500/50' : ''}
          `}
          placeholder="Enter your password"
          autoFocus
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {validationError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400 flex items-center"
        >
          <AlertCircle size={14} className="mr-1" />
          {validationError}
        </motion.p>
      )}
    </div>

    {error && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-red-500/10 border border-red-400/20 rounded-lg"
      >
        <p className="text-red-400 text-sm flex items-center">
          <AlertCircle size={14} className="mr-2" />
          {error}
        </p>
      </motion.div>
    )}

    <div className="flex space-x-3">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        icon={<ArrowLeft size={18} />}
        className="flex-1"
      >
        Back
      </Button>
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading || !password}
        className="flex-2"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </div>
  </div>
);

export default LoginStepPassword;
