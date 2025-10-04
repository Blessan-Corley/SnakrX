import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuthOperations } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';
import { isValidPassword } from '@/utils/gameUtils';

/**
 * Multi-step Forgot Password Page Component
 * Step 1: Username or Email entry
 * Step 2: Security Question answer
 * Step 3: New Password entry
 */
const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    identifier: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [verificationData, setVerificationData] = useState(null);

  const { verifySecurityAnswer, resetPassword, loading, error } = useAuthOperations();
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
   * Validate current step inputs
   */
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.identifier.trim()) {
        errors.identifier = 'Username or email is required';
      } else if (formData.identifier.includes('@')) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.identifier)) {
          errors.identifier = 'Please enter a valid email address';
        }
      } else {
        // Username validation
        if (formData.identifier.length < 3) {
          errors.identifier = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.identifier)) {
          errors.identifier = 'Username can only contain letters, numbers, and underscores';
        }
      }
    }

    if (step === 2) {
      if (!formData.securityAnswer.trim()) {
        errors.securityAnswer = 'Security answer is required';
      } else if (formData.securityAnswer.trim().length < 2) {
        errors.securityAnswer = 'Security answer must be at least 2 characters';
      }
    }

    if (step === 3) {
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (!isValidPassword(formData.newPassword)) {
        errors.newPassword = 'Password must be at least 6 characters long';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle step 1 submission (verify user exists)
   */
  const handleStep1Submit = async () => {
    if (!validateStep(1)) return;

    // In a real implementation, you might want to check if user exists first
    // For now, we'll proceed to step 2 directly
    setCurrentStep(2);
    playClick();
  };

  /**
   * Handle step 2 submission (verify security answer)
   */
  const handleStep2Submit = async () => {
    if (!validateStep(2)) return;

    const result = await verifySecurityAnswer(formData.identifier, formData.securityAnswer);
    
    if (result.success) {
      setVerificationData(result);
      setCurrentStep(3);
      playClick();
    }
  };

  /**
   * Handle step 3 submission (reset password)
   */
  const handleStep3Submit = async () => {
    if (!validateStep(3) || !verificationData) return;

    const result = await resetPassword(verificationData.email, formData.newPassword);
    
    if (result.success) {
      // Show success message and redirect to login
      navigate('/login', { 
        state: { 
          message: 'Password reset successful! Please sign in with your new password.',
          type: 'success'
        }
      });
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
   * Handle key press events
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === 1) {
        handleStep1Submit();
      } else if (currentStep === 2) {
        handleStep2Submit();
      } else {
        handleStep3Submit();
      }
    }
  };

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

  const passwordStrength = getPasswordStrength(formData.newPassword);

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
            🔑
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-white/70">
            Regain access to your SnakrX account
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

        {/* Password Reset Form Card */}
        <Card variant="glass" padding="lg" className="mb-6">
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
                    Find Your Account
                  </h2>
                  <p className="text-white/70 text-sm">
                    Enter your username or email address
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Username or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {formData.identifier.includes('@') ? (
                          <Mail className="h-5 w-5 text-white/40" />
                        ) : (
                          <User className="h-5 w-5 text-white/40" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.identifier}
                        onChange={(e) => updateFormData('identifier', e.target.value)}
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
                    onClick={handleStep1Submit}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    disabled={!formData.identifier.trim()}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Security Question */}
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
                    Security Verification
                  </h2>
                  <p className="text-white/70 text-sm">
                    Answer your security question to verify your identity
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
                      This is case insensitive
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
                      type="button"
                      variant="primary"
                      onClick={handleStep2Submit}
                      loading={loading}
                      disabled={loading || !formData.securityAnswer.trim()}
                      className="flex-2"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: New Password */}
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
                    Create New Password
                  </h2>
                  <p className="text-white/70 text-sm">
                    Choose a strong password for your account
                  </p>
                </div>

                <div className="space-y-4">
                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/40" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => updateFormData('newPassword', e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={`
                          block w-full pl-10 pr-12 py-3 border rounded-xl
                          bg-white/5 border-white/20 text-white placeholder-white/50
                          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                          transition-all duration-200
                          ${validationErrors.newPassword ? 'border-red-400 focus:ring-red-500/50' : ''}
                        `}
                        placeholder="Enter new password"
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
                    {formData.newPassword && (
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
                    
                    {validationErrors.newPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400 flex items-center"
                      >
                        <AlertCircle size={14} className="mr-1" />
                        {validationErrors.newPassword}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Confirm New Password
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
                        placeholder="Confirm new password"
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
                      type="button"
                      variant="primary"
                      onClick={handleStep3Submit}
                      loading={loading}
                      disabled={loading || !formData.newPassword || !formData.confirmPassword}
                      icon={<KeyRound size={18} />}
                      className="flex-2"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <span className="text-sm">Remember your password?</span>
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

export default ForgotPasswordPage;