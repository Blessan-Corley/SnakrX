import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset viewport to top on route changes for predictable page navigation.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      if (document?.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document?.body) {
        document.body.scrollTop = 0;
      }
    };

    // Apply immediately and once more on next frame/tick to beat browser restoration timing.
    resetScroll();
    const rafId = window.requestAnimationFrame(resetScroll);
    const timeoutId = window.setTimeout(resetScroll, 0);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
