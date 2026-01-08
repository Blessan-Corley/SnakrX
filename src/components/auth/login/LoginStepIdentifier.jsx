import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Mail } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';

const LoginStepIdentifier = ({
  identifier,
  onContinue,
  onIdentifierChange,
  onKeyPress,
  validationError
}) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h2 className="text-xl font-semibold text-white mb-2">
        Enter Your Credentials
      </h2>
      <p className="text-white/70 text-sm">
        Email address
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">
        Email
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-white/40" />
        </div>
        <input
          type="email"
          value={identifier}
          onChange={(event) => onIdentifierChange(event.target.value)}
          onKeyPress={onKeyPress}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-xl
            bg-white/5 border-white/20 text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
            transition-all duration-200
            ${validationError ? 'border-red-400 focus:ring-red-500/50' : ''}
          `}
          placeholder="Enter your email"
          autoFocus
          autoComplete="email"
        />
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

    <Button
      type="button"
      variant="primary"
      fullWidth
      onClick={onContinue}
      icon={<ArrowRight size={18} />}
      iconPosition="right"
      disabled={!identifier.trim()}
    >
      Continue
    </Button>
  </div>
);

export default LoginStepIdentifier;
