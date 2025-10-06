import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useAuthOperations } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';
import { isValidEmail, isValidUsername, isValidPassword } from '@/utils/gameUtils';

/**
 * Multi-step Registration Page Component
 * Step 1: Username and Email entry
 * Step 2: Password entry
 * Step 3: Security Question
 */
const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const { signUp, checkUsernameAvailability, loading, error } = useAuthOperations();
  const navigate = useNavigate();

  /**
   * Update form data
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors for the field being updated
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Check username availability
   */
  const checkUsername = async (username) => {
    if (!isValidUsername(username)) {
      setUsernameAvailable(false);
      return;
    }

    setUsernameChecking(true);
    try {
      const available = await checkUsernameAvailability(username);
      setUsernameAvailable(available);
    } catch (error) {
      setUsernameAvailable(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  /**
   * Validate current step inputs
   */
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      // Username validation
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
      } else if (!isValidUsername(formData.username)) {
        errors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
      } else if (usernameAvailable === false) {
        errors.username = 'Username is already taken';
      }

      // Email validation
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!isValidEmail(formData.email)) {
        errors.email = 'Please use a valid email from gmail.com, outlook.com, yahoo.com, or mail.com';
      }
    }

    if (step === 2) {
      // Password validation
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (!isValidPassword(formData.password)) {
        errors.password = 'Password must be at least 6 characters long';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      // Security answer validation
      if (!formData.securityAnswer.trim()) {
        errors.securityAnswer = 'Security answer is required';
      } else if (formData.securityAnswer.trim().length < 2) {
        errors.securityAnswer = 'Security answer must be at least 2 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Move to next step
   */
  const nextStep = async () => {
    if (currentStep === 1 && formData.username && usernameAvailable === null) {
      await checkUsername(formData.username);
      return;
    }

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
    
    if (!validateStep(3)) return;

    const result = await signUp({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      securityAnswer: formData.securityAnswer
    });
    
    if (result.success) {
      navigate('/login');
    }
  };

  /**
   * Handle key press events
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentStep < 3) {
        nextStep();
      } else {
        handleSubmit(e);
      }
    }
  };

  // Username change handler with debounced checking
  useEffect(() => {
    if (formData.username && isValidUsername(formData.username)) {
      const timer = setTimeout(() => {
        checkUsername(formData.username);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  // Animation variants for steps
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
            Join SnakrX
          </h1>
          <p className="text-white/70">
            Create your account and start gaming
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
            `}>
              {currentStep > 1 ? <CheckCircle size={16} /> : '1'}
            </div>
            <div className={`w-6 h-1 rounded-full ${currentStep >= 2 ? 'bg-primary-500' : 'bg-white/10'}`} />
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
            `}>
              {currentStep > 2 ? <CheckCircle size={16} /> : '2'}
            </div>
            <div className={`w-6 h-1 rounded-full ${currentStep >= 3 ? 'bg-primary-500' : 'bg-white/10'}`} />
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}
            `}>
              3
            </div>
          </div>
        </motion.div>

        {/* Registration Form Card */}
        <Card variant="glass" padding="lg" className="mb-6">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Username and Email */}
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
                      Account Details
                    </h2>
                    <p className="text-white/70 text-sm">
                      Choose your username and email
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Username Field */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-white/40" />
                        </div>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => updateFormData('username', e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-10 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.username ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Choose a username"
                          autoFocus
                          autoComplete="username"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {usernameChecking && (
                            <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                          )}
                          {!usernameChecking && usernameAvailable === true && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                          {!usernameChecking && usernameAvailable === false && (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>
                      {validationErrors.username && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          {validationErrors.username}
                        </motion.p>
                      )}
                      <p className="mt-1 text-xs text-white/50">
                        Must be 3+ characters, letters, numbers, and underscores only
                      </p>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-white/40" />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-3 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.email ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                      </div>
                      {validationErrors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          {validationErrors.email}
                        </motion.p>
                      )}
                      <p className="mt-1 text-xs text-white/50">
                        We support gmail.com, outlook.com, yahoo.com, and mail.com
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      onClick={nextStep}
                      icon={<ArrowRight size={18} />}
                      iconPosition="right"
                      disabled={!formData.username.trim() || !formData.email.trim() || usernameChecking}
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
                      Secure Your Account
                    </h2>
                    <p className="text-white/70 text-sm">
                      Create a strong password
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Password Field */}
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
                          value={formData.password}
                          onChange={(e) => updateFormData('password', e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-12 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.password ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Create a password"
                          autoFocus
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full ${
                                  passwordStrength >= level
                                    ? passwordStrength <= 2
                                      ? 'bg-red-400'
                                      : passwordStrength <= 4
                                      ? 'bg-yellow-400'
                                      : 'bg-green-400'
                                    : 'bg-white/10'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-xs text-white/60">
                            Password strength: {
                              passwordStrength <= 2 ? 'Weak' :
                              passwordStrength <= 4 ? 'Medium' : 'Strong'
                            }
                          </p>
                        </div>
                      )}
                      
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

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-white/40" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-12 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.confirmPassword ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          {validationErrors.confirmPassword}
                        </motion.p>
                      )}
                    </div>

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
                        type="button"
                        variant="primary"
                        onClick={nextStep}
                        icon={<ArrowRight size={18} />}
                        iconPosition="right"
                        disabled={!formData.password || !formData.confirmPassword}
                        className="flex-2"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Security Question */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Security Question
                    </h2>
                    <p className="text-white/70 text-sm">
                      Help us secure your account recovery
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        What is your favourite movie?
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-white/40" />
                        </div>
                        <input
                          type="text"
                          value={formData.securityAnswer}
                          onChange={(e) => updateFormData('securityAnswer', e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`
                            block w-full pl-10 pr-3 py-3 border rounded-xl
                            bg-white/5 border-white/20 text-white placeholder-white/50
                            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                            transition-all duration-200
                            ${validationErrors.securityAnswer ? 'border-red-400 focus:ring-red-500/50' : ''}
                          `}
                          placeholder="Enter your favourite movie"
                          autoFocus
                        />
                      </div>
                      {validationErrors.securityAnswer && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          {validationErrors.securityAnswer}
                        </motion.p>
                      )}
                      <p className="mt-1 text-xs text-white/50">
                        This will be used for password recovery (case insensitive)
                      </p>
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
                        disabled={loading || !formData.securityAnswer.trim()}
                        className="flex-2"
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
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
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <span className="text-sm">Already have an account?</span>
            <Link
              to="/login"
              onClick={() => playClick()}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign In
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

export default RegisterPage;