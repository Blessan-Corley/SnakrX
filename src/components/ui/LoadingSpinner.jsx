import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner Component with SnakrX design
 * Features smooth animations and gradient effects
 */
const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = '', 
  variant = 'primary',
  className = '' 
}) => {
  
  // Size configurations
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Variant configurations
  const variants = {
    primary: 'border-primary-500/30 border-t-primary-500',
    secondary: 'border-secondary-500/30 border-t-secondary-500',
    white: 'border-white/30 border-t-white',
    accent: 'border-accent-500/30 border-t-accent-500',
    gradient: 'border-transparent bg-gradient-to-r from-primary-500 to-secondary-500'
  };

  const spinnerClasses = [
    'border-4 rounded-full animate-spin',
    sizes[size],
    variants[variant],
    className
  ].filter(Boolean).join(' ');

  // Full screen loading component
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-dark flex items-center justify-center z-50">
        <div className="text-center">
          {/* Animated logo/icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="text-6xl mb-4">🐍</div>
            <h1 className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
              SnakrX
            </h1>
          </motion.div>

          {/* Main spinner */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-6"
          >
            <div className={`mx-auto ${sizes.lg} border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin`} />
          </motion.div>

          {/* Loading text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <p className="text-white/70 text-lg">
              {text || 'Loading your gaming experience...'}
            </p>
            
            {/* Loading dots animation */}
            <div className="flex justify-center space-x-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Regular spinner component
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses} />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-sm mt-3 text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Skeleton Loading Component
 * For content placeholders while data is loading
 */
export const SkeletonLoader = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  animate = true 
}) => (
  <div 
    className={`
      ${width} ${height} 
      bg-white/10 rounded-lg 
      ${animate ? 'animate-pulse' : ''}
      ${className}
    `} 
  />
);

/**
 * Card Skeleton for loading cards
 */
export const CardSkeleton = ({ className = '' }) => (
  <div className={`p-4 bg-white/5 border border-white/10 rounded-xl ${className}`}>
    <div className="animate-pulse">
      <SkeletonLoader height="h-6" width="w-3/4" className="mb-3" />
      <SkeletonLoader height="h-4" width="w-full" className="mb-2" />
      <SkeletonLoader height="h-4" width="w-5/6" className="mb-4" />
      <div className="flex space-x-2">
        <SkeletonLoader height="h-8" width="w-20" />
        <SkeletonLoader height="h-8" width="w-16" />
      </div>
    </div>
  </div>
);

/**
 * List Skeleton for loading lists
 */
export const ListSkeleton = ({ items = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
        <SkeletonLoader width="w-10" height="h-10" className="rounded-full" />
        <div className="flex-1">
          <SkeletonLoader height="h-4" width="w-1/3" className="mb-2" />
          <SkeletonLoader height="h-3" width="w-2/3" />
        </div>
        <SkeletonLoader height="h-6" width="w-16" />
      </div>
    ))}
  </div>
);

/**
 * Table Skeleton for loading tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4 p-3 bg-white/10 rounded-lg">
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonLoader key={index} height="h-4" width="w-1/4" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-3 bg-white/5 rounded-lg">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader key={colIndex} height="h-4" width="w-1/4" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Game Board Skeleton for loading game screens
 */
export const GameBoardSkeleton = ({ className = '' }) => (
  <div className={`text-center ${className}`}>
    <div className="animate-pulse">
      {/* Game title */}
      <SkeletonLoader height="h-8" width="w-48" className="mx-auto mb-6" />
      
      {/* Score area */}
      <div className="flex justify-center space-x-8 mb-6">
        <div className="text-center">
          <SkeletonLoader height="h-4" width="w-16" className="mb-2" />
          <SkeletonLoader height="h-6" width="w-20" />
        </div>
        <div className="text-center">
          <SkeletonLoader height="h-4" width="w-16" className="mb-2" />
          <SkeletonLoader height="h-6" width="w-20" />
        </div>
      </div>
      
      {/* Game board */}
      <SkeletonLoader height="h-96" width="w-96" className="mx-auto mb-6 rounded-xl" />
      
      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <SkeletonLoader height="h-10" width="w-20" className="rounded-lg" />
        <SkeletonLoader height="h-10" width="w-20" className="rounded-lg" />
      </div>
    </div>
  </div>
);

/**
 * Dots Loading Animation
 */
export const DotsLoader = ({ size = 'md', color = 'primary', className = '' }) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    white: 'bg-white',
    accent: 'bg-accent-500'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSizes[size]} ${colors[color]} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;