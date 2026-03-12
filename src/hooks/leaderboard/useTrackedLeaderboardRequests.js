import { useCallback, useEffect, useRef } from 'react';
import { CACHE_TTL_MS } from './constants.js';

export const useTrackedLeaderboardRequests = ({ setLoading }) => {
  const cacheRef = useRef({});
  const lastFetchRef = useRef({});
  const inFlightRequestsRef = useRef({});
  const activeRequestCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const applyIfMounted = useCallback((callback) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);

  const beginRequest = useCallback(() => {
    activeRequestCountRef.current += 1;
    applyIfMounted(() => setLoading(true));
  }, [applyIfMounted, setLoading]);

  const endRequest = useCallback(() => {
    activeRequestCountRef.current = Math.max(0, activeRequestCountRef.current - 1);
    applyIfMounted(() => setLoading(activeRequestCountRef.current > 0));
  }, [applyIfMounted, setLoading]);

  const runTrackedRequest = useCallback(async (requestKey, requestFactory) => {
    if (inFlightRequestsRef.current[requestKey]) {
      return inFlightRequestsRef.current[requestKey];
    }

    beginRequest();
    const requestPromise = Promise.resolve()
      .then(requestFactory)
      .finally(() => {
        delete inFlightRequestsRef.current[requestKey];
        endRequest();
      });

    inFlightRequestsRef.current[requestKey] = requestPromise;
    return requestPromise;
  }, [beginRequest, endRequest]);

  const isCacheValid = useCallback((key) => {
    const lastFetch = lastFetchRef.current[key];
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_TTL_MS;
  }, []);

  const clearCache = useCallback((key = null) => {
    if (key) {
      delete cacheRef.current[key];
      delete lastFetchRef.current[key];
      return;
    }

    cacheRef.current = {};
    lastFetchRef.current = {};
  }, []);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  return {
    applyIfMounted,
    cacheRef,
    clearCache,
    isCacheValid,
    isMountedRef,
    lastFetchRef,
    runTrackedRequest
  };
};

export default useTrackedLeaderboardRequests;
