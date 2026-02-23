import { useEffect, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { playClick } from '@/utils/sound';
import LandingBackground from '@/components/landing/LandingBackground';
import LandingNav from '@/components/landing/LandingNav';
import LandingHeroSection from '@/components/landing/LandingHeroSection';
import LandingFeaturesSection from '@/components/landing/LandingFeaturesSection';
import LandingModesSection from '@/components/landing/LandingModesSection';
import LandingTechSection from '@/components/landing/LandingTechSection';
import LandingCtaSection from '@/components/landing/LandingCtaSection';
import LandingFooter from '@/components/landing/LandingFooter';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      <LandingBackground mousePosition={mousePosition} y1={y1} />
      <LandingNav onAction={playClick} />
      <LandingHeroSection opacity={opacity} onAction={playClick} />
      <LandingFeaturesSection y2={y2} />
      <LandingModesSection />
      <LandingTechSection />
      <LandingCtaSection onAction={playClick} />
      <LandingFooter onAction={playClick} />
    </div>
  );
};

export default LandingPage;
