import { useCallback, useRef } from 'react';

export const useMountedState = () => {
  const isMountedRef = useRef(true);

  const setIfMounted = useCallback((callback) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);

  return {
    isMountedRef,
    setIfMounted
  };
};

export default useMountedState;
