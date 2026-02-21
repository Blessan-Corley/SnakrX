import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const SCROLL_THRESHOLD = 280;

const ScrollTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hideOnGameRoutes = location.pathname.startsWith('/game');
  if (hideOnGameRoutes || !isVisible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-dark-surface/90 text-white shadow-lg backdrop-blur-md transition hover:border-primary-400/50 hover:text-primary-300"
    >
      <ChevronUp size={18} />
    </button>
  );
};

export default ScrollTopButton;
