import { useCallback, useEffect } from 'react';
import { useBeforeUnload } from 'react-router-dom';

export const useGameSessionGuardEffects = ({
  bypassNavigationGuardRef,
  hasActiveSession,
  leaveConfirmState,
  location,
  pauseGame,
  requestLeaveConfirmation,
  showAchievementModal,
  visibilityPauseRef
}) => {
  useEffect(() => {
    if (!hasActiveSession) return undefined;
    if (leaveConfirmState.isOpen || showAchievementModal) {
      pauseGame();
    }
    return undefined;
  }, [hasActiveSession, leaveConfirmState.isOpen, pauseGame, showAchievementModal]);

  useEffect(() => {
    if (!hasActiveSession) return undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityPauseRef.current = true;
        pauseGame();
        return;
      }
      visibilityPauseRef.current = false;
    };
    const handleWindowBlur = () => {
      visibilityPauseRef.current = true;
      pauseGame();
    };
    const handleWindowFocus = () => {
      visibilityPauseRef.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [hasActiveSession, pauseGame, visibilityPauseRef]);

  useEffect(() => {
    const handleDocumentNavigation = (event) => {
      if (bypassNavigationGuardRef.current || !hasActiveSession) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      const currentPath = `${location.pathname}${location.search}`;
      const targetPath = `${url.pathname}${url.search}`;
      if (currentPath === targetPath) return;

      event.preventDefault();
      requestLeaveConfirmation(targetPath);
    };

    document.addEventListener('click', handleDocumentNavigation, true);
    return () => document.removeEventListener('click', handleDocumentNavigation, true);
  }, [
    bypassNavigationGuardRef,
    hasActiveSession,
    location.pathname,
    location.search,
    requestLeaveConfirmation
  ]);

  useEffect(() => {
    if (!hasActiveSession) return undefined;

    const handlePopState = () => {
      if (bypassNavigationGuardRef.current) return;
      window.history.pushState(null, '', `${location.pathname}${location.search}`);
      requestLeaveConfirmation('__BACK__');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    bypassNavigationGuardRef,
    hasActiveSession,
    location.pathname,
    location.search,
    requestLeaveConfirmation
  ]);

  useBeforeUnload(
    useCallback((event) => {
      if (!hasActiveSession) return;
      event.preventDefault();
      event.returnValue = '';
    }, [hasActiveSession])
  );
};
