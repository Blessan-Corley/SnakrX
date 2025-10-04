import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthOperations } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';

/**
 * Multi-step Login Page Component
 * Step 1: Username/Email entry
 * Step 2: Password entry
 */
const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { signIn, loading, error } = useAuthOperations();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state or default to home
  const from = location.state?.from || '/';

  /**
   * Validate current step inputs
   */
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!identifier.trim()) {
        errors.identifier = 'Username or email is required';
      } else if (identifier.includes('@')) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) {
          errors.identifier = 'Please enter a valid email address';
        }
      } else {
        // Username validation
        if (identifier.length < 3) {
          errors.identifier = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
          errors.identifier = 'Username can only contain letters, numbers, and underscores';
        }
      }
    }

    if (step === 2) {
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Move to next step
   */
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      playClick();
    }
  };

  /**
   * Move to previous step
   */
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setValidationErrors({});
    playClick();
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    const result = await signIn(identifier, password);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  /**
   * Handle key press events
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === 1) {
        nextStep();
      } else {
        handleSubmit(e);
      }
    }
  };

  // Animation variants for steps
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark opacity-90" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="text-6xl mb-4"
          >
            🐍
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-2">
            Welcome Back to SnakrX
          </h1>
          <p className="text-white/70">
            Sign in to continue your gaming journey
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
            `}>
              {currentStep > 1 ? <CheckCircle size={16} /> : '1'}
            </div>
            <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? 'bg-primary-500' : 'bg-white/10'}`} />
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
            `}>
              2
            </div>
          </div>
        </motion.div>

        {/* Login Form Card */}
        <Card variant="glass" padding="lg" className="mb-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Username/Email */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Enter Your Credentials
                    </h2>
                    <p className="text-white/70 text-sm">
                      Username or email address
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Username or Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {identifier.includes('@') ? (
                            <Mail className="h-5 w-5 text-white/40" />
                          ) : (
                            <User className="h-5 w-5 text-white/40" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-3 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.identifier ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Enter username or email"
                          autoFocus
                          autoComplete="username"
                        />
                      </div>
                      {validationErrors.identifier && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          {validationErrors.identifier}
                        </motion.p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      onClick={nextStep}
                      icon={<ArrowRight size={18} />}
                      iconPosition="right"
                      disabled={!identifier.trim()}
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Password */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Enter Password
                    </h2>
                    <p className="text-white/70 text-sm">
                      Welcome back, {identifier.includes('@') ? identifier.split('@')[0] : identifier}
                    </p>
                  </div>

                  <div className="space-y-4">
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
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-12 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.password ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Enter your password"
                          autoFocus
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          {validationErrors.password}
                        </motion.p>
                      )}
                    </div>

                    {/* Error Message */}
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

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
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
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <Link
            to="/forgot-password"
            onClick={() => playClick()}
            className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
          >
            Forgot your password?
          </Link>
          
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <span className="text-sm">Don't have an account?</span>
            <Link
              to="/register"
              onClick={() => playClick()}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Create Account
            </Link>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <Link
              to="/landing"
              onClick={() => playClick()}
              className="text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              ← Back to Landing
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;