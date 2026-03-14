import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, KeyRound, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  auth,
  confirmPasswordReset,
  verifyPasswordResetCode
} from '@/services/firebase/index.js';
import { playClick } from '@/utils/sound';
import { validators } from '@/utils/validation';

const validateResetLink = (mode, oobCode) => (
  mode === 'resetPassword' && typeof oobCode === 'string' && oobCode.trim().length > 0
);

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLinkValid = useMemo(() => validateResetLink(mode, oobCode), [mode, oobCode]);

  useEffect(() => {
    let active = true;

    const verifyLink = async () => {
      if (!isLinkValid) {
        setStatus('invalid');
        setError('Invalid reset link. Please request a new password reset email.');
        return;
      }

      try {
        const resolvedEmail = await verifyPasswordResetCode(auth, oobCode);
        if (!active) return;
        setEmail(resolvedEmail || '');
        setStatus('ready');
      } catch (_err) {
        if (!active) return;
        setStatus('invalid');
        setError('This reset link is invalid or has expired. Request a new one to continue.');
      }
    };

    verifyLink();

    return () => {
      active = false;
    };
  }, [isLinkValid, oobCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const passwordValidation = validators.password(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, passwordValidation.value);
      setStatus('success');
    } catch (_err) {
      setError('Unable to reset your password with this link. Request a new reset email and try again.');
      setStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center text-5xl mb-4">
            {status === 'invalid'
              ? <ShieldAlert className="text-orange-300" size={48} />
              : <KeyRound className="text-white/80" size={48} />}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-2">
            Password Recovery
          </h1>
          <p className="text-white/70">
            Reset your SnakrX password without leaving the game experience.
          </p>
        </motion.div>

        <Card variant="glass" padding="lg">
          {status === 'loading' && (
            <div className="text-center space-y-3">
              <p className="text-white/80">Validating your reset link...</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center space-y-4">
              <ShieldAlert className="mx-auto text-orange-300" size={44} />
              <h2 className="text-2xl font-bold text-white">Invalid Reset Link</h2>
              <p className="text-white/70">{error}</p>
              <Link
                to="/forgot-password"
                onClick={playClick}
                className="inline-flex items-center justify-center rounded-xl border border-primary-400/30 px-5 py-3 text-primary-300 transition hover:bg-primary-400/10"
              >
                Request a new reset email
              </Link>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {email ? `Create a new password for ${email}.` : 'Create a new password for your account.'}
              </div>

              <div>
                <label className="block text-white/80 mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                onClick={playClick}
              >
                Save New Password
              </Button>
            </form>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto text-green-400" size={48} />
              <h2 className="text-2xl font-bold text-white">Password Updated Successfully</h2>
              <p className="text-white/80">
                Your SnakrX password has been updated. You can sign in with the new password now.
              </p>
              <Link
                to="/login"
                onClick={playClick}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 font-semibold text-white transition hover:from-primary-400 hover:to-primary-500"
              >
                Back to login
              </Link>
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

export default ResetPasswordPage;
