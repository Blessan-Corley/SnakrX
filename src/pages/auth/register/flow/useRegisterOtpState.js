import { useCallback, useEffect, useState } from 'react';
import { requestEmailOtp, verifyEmailOtp } from '@/services/firebase/emailOtp.js';
import { initialOtpState } from './registerFlowState.js';

const useRegisterOtpState = () => {
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState(initialOtpState);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);

  const sendOtpForEmail = useCallback(async (email) => {
    setOtpSending(true);
    setOtpStatus((previous) => ({ ...previous, error: null }));
    try {
      const response = await requestEmailOtp(email);
      const expiresAt = response?.expiresAt || null;
      setOtpStatus({ sent: true, verified: false, expiresAt, error: null });
      setResendAvailableAt(Date.now() + 60 * 1000);
      return { success: true };
    } catch (error) {
      const message = error?.message || 'Unable to send verification code.';
      if (error?.retryAfterMs) {
        setResendAvailableAt(Date.now() + error.retryAfterMs);
      }
      setOtpStatus((previous) => ({ ...previous, error: message }));
      return { success: false, message };
    } finally {
      setOtpSending(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email) => {
    setOtpVerifying(true);
    setOtpStatus((previous) => ({ ...previous, error: null }));
    try {
      await verifyEmailOtp(email, otpCode.trim());
      setOtpStatus((previous) => ({ ...previous, verified: true }));
      return { success: true };
    } catch (error) {
      const message = error?.message || 'Verification failed. Please try again.';
      setOtpStatus((previous) => ({ ...previous, error: message }));
      return { success: false, message };
    } finally {
      setOtpVerifying(false);
    }
  }, [otpCode]);

  const handleResendOtp = useCallback(async (email) => {
    const otpResult = await sendOtpForEmail(email);
    if (!otpResult.success) {
      setOtpStatus((previous) => ({ ...previous, error: otpResult.message || 'Unable to resend code.' }));
    }
  }, [sendOtpForEmail]);

  useEffect(() => {
    if (!otpStatus.expiresAt) {
      setOtpSecondsLeft(0);
      return undefined;
    }

    const updateTimer = () => {
      const remainingMs = otpStatus.expiresAt - Date.now();
      setOtpSecondsLeft(Math.max(0, Math.floor(remainingMs / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [otpStatus.expiresAt]);

  return {
    handleResendOtp,
    otpCode,
    otpSecondsLeft,
    otpSending,
    otpStatus,
    otpVerifying,
    resendAvailableAt,
    sendOtpForEmail,
    setOtpCode,
    verifyOtp
  };
};

export default useRegisterOtpState;
