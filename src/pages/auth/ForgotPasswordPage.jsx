import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { useAuthOperations } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';
import { validators } from '@/utils/validation';

/**
 * Password Reset Page
 * Uses Firebase's secure email reset flow (production-safe)
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const { resetPassword, loading, error } = useAuthOperations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailValidation = validators.email(email);
    if (!emailValidation.valid) {
      setValidationError(emailValidation.error);
      return;
    }

    setValidationError('');
    const result = await resetPassword(emailValidation.value);
    if (result.success) {
      setSent(true);
      const nextCooldown = Date.now() + 60 * 1000;
      setCooldownUntil(nextCooldown);
    }
  };

  const isCooldownActive = cooldownUntil > Date.now();

  useEffect(() => {
    if (!cooldownUntil || sent) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(remaining);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [cooldownUntil, sent]);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center text-5xl mb-4">
            <Lock className="text-white/80" size={48} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-2">
            Reset Your Password
          </h1>
          <p className="text-white/70">
            We&apos;ll send a secure reset link to your email.
          </p>
        </motion.div>

        <Card variant="glass" padding="lg">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/80 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2 rounded-md bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {validationError && (
                  <p className="text-red-400 text-sm mt-2">{validationError}</p>
                )}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                onClick={playClick}
                disabled={loading || isCooldownActive}
              >
                {isCooldownActive ? `Try again in ${cooldownSeconds}s` : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto text-green-400" size={48} />
              <p className="text-white/80">
                Reset link sent. Please check your inbox.
              </p>
            </div>
          )}
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/login"
            onClick={playClick}
            className="inline-flex items-center text-white/70 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
