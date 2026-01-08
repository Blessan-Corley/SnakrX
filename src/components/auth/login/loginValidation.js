const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginStep = ({ identifier, password, step }) => {
  const errors = {};

  if (step === 1) {
    if (!identifier.trim()) {
      errors.identifier = 'Email is required';
    } else if (!emailRegex.test(identifier)) {
      errors.identifier = 'Please enter a valid email address';
    }
  }

  if (step === 2) {
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
  }

  return errors;
};
