import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TypewriterText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    }

    onComplete?.();
    return undefined;
  }, [currentIndex, onComplete, text]);

  return (
    <span className="font-mono">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="text-primary-500"
      >
        |
      </motion.span>
    </span>
  );
};

export default TypewriterText;
