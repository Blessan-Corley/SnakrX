import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { playClick, playHover } from '@/utils/sound';

/**
 * Reusable Button Component with SnakrX design system
 * Features ghost buttons, gradients, and smooth hover effects
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  soundEnabled = true,
  ...props
}, ref) => {

  // Variant styles - focusing on ghost buttons and gradients
  const variants = {
    primary: {
      base: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-transparent',
      hover: 'hover:from-primary-400 hover:to-primary-500 hover:shadow-glow',
      disabled: 'bg-gray-400 text-gray-200 cursor-not-allowed'
    },
    secondary: {
      base: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-transparent',
      hover: 'hover:from-secondary-400 hover:to-secondary-500 hover:shadow-purple-500/30',
      disabled: 'bg-gray-400 text-gray-200 cursor-not-allowed'
    },
    ghost: {
      base: 'bg-transparent text-white border border-white/20 backdrop-blur-sm',
      hover: 'hover:bg-white/10 hover:border-white/40 hover:shadow-card',
      disabled: 'bg-transparent text-gray-400 border-gray-600 cursor-not-allowed'
    },
    'ghost-primary': {
      base: 'bg-transparent text-primary-400 border border-primary-400/30 backdrop-blur-sm',
      hover: 'hover:bg-primary-400/10 hover:border-primary-400/60 hover:text-primary-300 hover:shadow-glow',
      disabled: 'bg-transparent text-gray-400 border-gray-600 cursor-not-allowed'
    },
    danger: {
      base: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent',
      hover: 'hover:from-red-400 hover:to-red-500 hover:shadow-red-500/30',
      disabled: 'bg-gray-400 text-gray-200 cursor-not-allowed'
    },
    success: {
      base: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent',
      hover: 'hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30',
      disabled: 'bg-gray-400 text-gray-200 cursor-not-allowed'
    },
    minimal: {
      base: 'bg-transparent text-white/80 border-none',
      hover: 'hover:text-white hover:bg-white/5',
      disabled: 'text-gray-500 cursor-not-allowed'
    }
  };

  // Size styles
  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl',
    icon: 'p-3 rounded-xl'
  };

  // Get current variant styles
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  // Build className
  const buttonClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-bg',
    'transform active:scale-95',
    sizeStyles,
    disabled || loading ? variantStyles.disabled : `${variantStyles.base} ${variantStyles.hover}`,
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  // Handle click with sound and debouncing to prevent rapid clicks
  const handleClick = React.useCallback((e) => {
    if (disabled || loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    try {
      if (soundEnabled) {
        playClick();
      }
      
      if (onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error('Button click error:', error);
    }
  }, [disabled, loading, soundEnabled, onClick]);

  // Handle hover with sound and error handling
  const handleMouseEnter = React.useCallback(() => {
    if (disabled || loading) return;
    
    try {
      if (soundEnabled) {
        playHover();
      }
    } catch (error) {
      console.warn('Button hover sound error:', error);
    }
  }, [disabled, loading, soundEnabled]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <motion.div
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  // Icon positioning
  const iconSpacing = size === 'icon' ? '' : (iconPosition === 'left' ? 'mr-2' : 'ml-2');

  return (
    <motion.button
      ref={ref}
      className={buttonClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      {...props}
    >
      {/* Loading state */}
      {loading && (
        <>
          <LoadingSpinner />
          {size !== 'icon' && <span className="ml-2">Loading...</span>}
        </>
      )}

      {/* Normal state */}
      {!loading && (
        <>
          {icon && iconPosition === 'left' && (
            <span className={iconSpacing}>
              {icon}
            </span>
          )}
          
          {size !== 'icon' && children}
          
          {icon && iconPosition === 'right' && (
            <span className={iconSpacing}>
              {icon}
            </span>
          )}
          
          {size === 'icon' && icon && icon}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

// Preset button components for common use cases
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const MinimalButton = (props) => <Button variant="minimal" {...props} />;

// Icon button specifically styled for icons
export const IconButton = ({ icon, ...props }) => (
  <Button variant="ghost" size="icon" icon={icon} {...props} />
);

export default Button;