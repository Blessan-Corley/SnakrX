import { useCallback, useEffect, useState } from 'react';
import { validators } from '@/utils/validation.js';

const useUsernameAvailability = ({ checkUsernameAvailability, username }) => {
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const checkUsername = useCallback(async (candidate) => {
    const usernameValidation = validators.username(candidate);
    if (!usernameValidation.valid) {
      setUsernameAvailable(false);
      return false;
    }

    setUsernameChecking(true);
    try {
      const available = await checkUsernameAvailability(candidate);
      setUsernameAvailable(available);
      return available;
    } catch {
      setUsernameAvailable(false);
      return false;
    } finally {
      setUsernameChecking(false);
    }
  }, [checkUsernameAvailability]);

  useEffect(() => {
    const usernameValidation = validators.username(username);
    if (username && usernameValidation.valid) {
      const timer = setTimeout(() => {
        checkUsername(username);
      }, 500);
      return () => clearTimeout(timer);
    }

    setUsernameAvailable(null);
    return undefined;
  }, [checkUsername, username]);

  return {
    checkUsername,
    usernameAvailable,
    usernameChecking
  };
};

export default useUsernameAvailability;
