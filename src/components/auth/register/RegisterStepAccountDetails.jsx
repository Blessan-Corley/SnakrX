import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, Mail, User, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { stepVariants } from './registerUtils.js';

const RegisterStepAccountDetails = ({
  formData,
  handleKeyPress,
  onNext,
  onUpdateFormData,
  otpSending,
  usernameAvailable,
  usernameChecking,
  validationErrors,
}) => (
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
            onChange={(event) => onUpdateFormData('username', event.target.value)}
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
            onChange={(event) => onUpdateFormData('email', event.target.value)}
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
          We will never share your email.
        </p>
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth
        onClick={onNext}
        icon={<ArrowRight size={18} />}
        iconPosition="right"
        loading={otpSending}
        disabled={!formData.username.trim() || !formData.email.trim() || usernameChecking || otpSending}
      >
        {otpSending ? 'Sending Code...' : 'Send Verification Code'}
      </Button>
    </div>
  </motion.div>
);

export default RegisterStepAccountDetails;
