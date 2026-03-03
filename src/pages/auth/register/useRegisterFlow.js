import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthOperations } from '@/hooks/useAuth.js';
import { playClick } from '@/utils/sound.js';
import { validators } from '@/utils/validation.js';
import { initialFormData } from './flow/registerFlowState.js';
import { validateRegisterStep } from './registerFlowValidation.js';
import useRegisterOtpState from './flow/useRegisterOtpState.js';
import useUsernameAvailability from './flow/useUsernameAvailability.js';

const useRegisterFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { signUp, checkUsernameAvailability, loading } = useAuthOperations();
  const navigate = useNavigate();
  const {
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
  } = useRegisterOtpState();
  const {
    checkUsername,
    usernameAvailable,
    usernameChecking
  } = useUsernameAvailability({
    checkUsernameAvailability,
    username: formData.username
  });

  const updateFormData = useCallback((field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setValidationErrors((previous) => {
      if (!previous[field]) return previous;
      return {
        ...previous,
        [field]: null
      };
    });
  }, []);

  const validateStep = useCallback((step) => {
    const errors = validateRegisterStep({
      formData,
      otpCode,
      step,
      usernameAvailable
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, otpCode, usernameAvailable]);

  const nextStep = useCallback(async () => {
    if (currentStep === 1) {
      if (formData.username && usernameAvailable === null) {
        await checkUsername(formData.username);
        return;
      }

      if (!validateStep(1)) return;

      const emailValidation = validators.email(formData.email);
      if (!emailValidation.valid) {
        setValidationErrors((previous) => ({ ...previous, email: emailValidation.error }));
        return;
      }

      const otpResult = await sendOtpForEmail(emailValidation.value);
      if (!otpResult.success) {
        setValidationErrors((previous) => ({ ...previous, email: otpResult.message }));
        return;
      }

      setCurrentStep(2);
      playClick();
      return;
    }

    if (currentStep === 2) {
      if (!validateStep(2)) return;

      const verification = await verifyOtp(formData.email);
      if (verification.success) {
        setCurrentStep(3);
        playClick();
      }
      return;
    }

    if (!validateStep(currentStep)) return;
    setCurrentStep((previous) => previous + 1);
    playClick();
  }, [
    checkUsername,
    currentStep,
    formData,
    sendOtpForEmail,
    usernameAvailable,
    validateStep,
    verifyOtp
  ]);

  const prevStep = useCallback(() => {
    setCurrentStep((previous) => previous - 1);
    setValidationErrors({});
    playClick();
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!validateStep(3)) return;

    const result = await signUp({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      navigate('/');
    }
  }, [formData, navigate, signUp, validateStep]);

  const handleKeyPress = useCallback((event) => {
    if (event.key !== 'Enter') return;
    if (currentStep < 3) {
      nextStep();
      return;
    }
    handleSubmit(event);
  }, [currentStep, handleSubmit, nextStep]);

  return {
    currentStep,
    formData,
    handleKeyPress,
    handleResendOtp,
    handleSubmit,
    loading,
    nextStep,
    otpCode,
    otpSecondsLeft,
    otpSending,
    otpStatus,
    otpVerifying,
    prevStep,
    resendAvailableAt,
    setOtpCode,
    setShowConfirmPassword,
    setShowPassword,
    showConfirmPassword,
    showPassword,
    updateFormData,
    usernameAvailable,
    usernameChecking,
    validationErrors
  };
};

export default useRegisterFlow;
