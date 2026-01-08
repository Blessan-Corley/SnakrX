import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatOtpCountdown, stepVariants } from './registerUtils.js';

const RegisterStepEmailVerification = ({
  formData,
  handleKeyPress,
  onBack,
  onOtpCodeChange,
  onResend,
  onVerify,
  otpCode,
  otpSecondsLeft,
  otpSending,
  otpStatus,
  otpVerifying,
  resendAvailableAt,
  validationErrors,
}) => (
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
        Verify Your Email
      </h2>
      <p className="text-white/70 text-sm">
        Enter the 6-digit code sent to {formData.email}
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={otpCode}
          onChange={(event) => onOtpCodeChange(event.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={6}
          className={`
            block w-full px-4 py-3 border rounded-xl
            bg-white/5 border-white/20 text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
            transition-all duration-200 text-center tracking-widest
            ${validationErrors.otpCode ? 'border-red-400 focus:ring-red-500/50' : ''}
          `}
          placeholder="000000"
          autoFocus
          inputMode="numeric"
        />
        {validationErrors.otpCode && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400 flex items-center"
          >
            <AlertCircle size={14} className="mr-1" />
            {validationErrors.otpCode}
          </motion.p>
        )}
        {otpStatus.error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400 flex items-center"
          >
            <AlertCircle size={14} className="mr-1" />
            {otpStatus.error}
          </motion.p>
        )}
        {otpStatus.expiresAt && (
          <p className="mt-2 text-xs text-white/60">
            Code expires in {formatOtpCountdown(otpSecondsLeft)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Did not receive the code?</span>
        <button
          type="button"
          disabled={Date.now() < resendAvailableAt || otpSending}
          onClick={onResend}
          className={`text-primary-400 hover:text-primary-300 ${
            Date.now() < resendAvailableAt || otpSending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Resend code
        </button>
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
          type="button"
          variant="primary"
          loading={otpVerifying}
          disabled={otpVerifying || otpSending || !otpCode.trim()}
          className="flex-2"
          onClick={onVerify}
        >
          {otpVerifying ? 'Verifying...' : 'Verify Code'}
        </Button>
      </div>
    </div>
  </motion.div>
);

export default RegisterStepEmailVerification;
