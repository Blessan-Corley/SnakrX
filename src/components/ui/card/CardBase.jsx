import { forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import { buildCardClassName, CARD_MOTION_VARIANTS } from './styles.js';

const Card = memo(forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = true,
  clickable = false,
  disabled = false,
  interactiveElement = 'button',
  gradient = false,
  glow = false,
  className = '',
  onClick,
  type = 'button',
  onKeyDown,
  ...props
}, ref) => {
  const interactive = clickable && !disabled;
  const useButtonElement = clickable && interactiveElement === 'button';
  const MotionComponent = useButtonElement ? motion.button : motion.div;
  const cardClasses = buildCardClassName({
    variant,
    padding,
    hover,
    clickable,
    disabled,
    gradient,
    glow,
    className
  });
  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive || useButtonElement) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event);
    }
  };

  return (
    <MotionComponent
      ref={ref}
      className={cardClasses}
      type={useButtonElement ? type : undefined}
      disabled={useButtonElement ? disabled : undefined}
      role={clickable && !useButtonElement ? 'button' : undefined}
      tabIndex={clickable && !useButtonElement ? (disabled ? -1 : 0) : undefined}
      aria-disabled={clickable && disabled ? true : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : onKeyDown}
      variants={CARD_MOTION_VARIANTS(interactive)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={interactive ? 'hover' : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}));

Card.displayName = 'Card';

export default Card;
