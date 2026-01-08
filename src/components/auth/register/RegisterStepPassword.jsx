import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getPasswordStrength, stepVariants } from './registerUtils.js';

const RegisterStepPassword = ({
  formData,
  handleKeyPress,
  loading,
  onBack,
  onToggleConfirmPassword,
  onTogglePassword,
  onUpdateFormData,
  showConfirmPassword,
  showPassword,
  validationErrors,
}) => {
  const passwordStrength = getPasswordStrength(formData.password);

  return (
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
          Secure Your Account
        </h2>
        <p className="text-white/70 text-sm">
          Create a strong password
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
              value={formData.password}
              onChange={(event) => onUpdateFormData('password', event.target.value)}
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
              onClick={onTogglePassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

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
              onChange={(event) => onUpdateFormData('confirmPassword', event.target.value)}
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
              onClick={onToggleConfirmPassword}
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
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          loading={loading}
          disabled={loading || !formData.password || !formData.confirmPassword}
          className="flex-2"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterStepPassword;
