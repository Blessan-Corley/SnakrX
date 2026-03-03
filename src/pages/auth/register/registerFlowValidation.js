import { validators } from '@/utils/validation.js';

export const validateRegisterStep = ({
  formData,
  otpCode,
  step,
  usernameAvailable
}) => {
  const errors = {};

  if (step === 1) {
    const usernameValidation = validators.username(formData.username);
    if (!usernameValidation.valid) {
      errors.username = usernameValidation.error;
    } else if (usernameAvailable === false) {
      errors.username = 'Username is already taken';
    }

    const emailValidation = validators.email(formData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }

  if (step === 2) {
    if (!otpCode.trim()) {
      errors.otpCode = 'Verification code is required';
    } else if (!/^\d{6}$/.test(otpCode.trim())) {
      errors.otpCode = 'Enter the 6-digit code sent to your email';
    }
  }

  if (step === 3) {
    const passwordValidation = validators.password(formData.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
};
