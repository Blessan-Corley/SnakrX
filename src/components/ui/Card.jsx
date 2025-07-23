import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Card Component with SnakrX glass morphism design
 * Features gradient backgrounds, backdrop blur, and hover animations
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = true,
  clickable = false,
  gradient = false,
  glow = false,
  className = '',
  onClick,
  ...props
}, ref) => {

  // Variant styles
  const variants = {
    default: {
      base: 'bg-white/5 border border-white/10 backdrop-blur-sm',
      hover: 'hover:bg-white/10 hover:border-white/20 hover:shadow-card-hover'
    },
    glass: {
      base: 'bg-gradient-card border border-white/20 backdrop-blur-md',
      hover: 'hover:bg-white/15 hover:border-white/30 hover:shadow-card-hover'
    },
    solid: {
      base: 'bg-dark-card border border-dark-border',
      hover: 'hover:bg-dark-surface hover:shadow-card-hover'
    },
    gradient: {
      base: 'bg-gradient-sunset border border-primary-400/20',
      hover: 'hover:shadow-glow-lg hover:border-primary-400/40'
    },
    'gradient-dark': {
      base: 'bg-gradient-gaming border border-accent-400/20',
      hover: 'hover:shadow-accent-500/30 hover:border-accent-400/40'
    },
    success: {
      base: 'bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm',
      hover: 'hover:bg-emerald-500/20 hover:border-emerald-400/40'
    },
    warning: {
      base: 'bg-yellow-500/10 border border-yellow-400/20 backdrop-blur-sm',
      hover: 'hover:bg-yellow-500/20 hover:border-yellow-400/40'
    },
    danger: {
      base: 'bg-red-500/10 border border-red-400/20 backdrop-blur-sm',
      hover: 'hover:bg-red-500/20 hover:border-red-400/40'
    },
    achievement: {
      base: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 backdrop-blur-sm',
      hover: 'hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/40 hover:shadow-purple-500/20'
    }
  };

  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  // Get current variant styles
  const variantStyles = variants[variant] || variants.default;
  const paddingStyles = paddings[padding] || paddings.md;

  // Build className
  const cardClasses = [
    'rounded-xl transition-all duration-300',
    paddingStyles,
    variantStyles.base,
    hover && !clickable ? variantStyles.hover : '',
    clickable ? `cursor-pointer ${variantStyles.hover} transform hover:scale-[1.02] active:scale-[0.98]` : '',
    glow ? 'shadow-glow' : 'shadow-card',
    gradient ? 'animate-gradient bg-gradient-sunset' : '',
    className
  ].filter(Boolean).join(' ');

  // Animation variants for framer motion
  const motionVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    hover: clickable ? { scale: 1.02, y: -2 } : {}
  };

  const CardComponent = (
    <motion.div
      ref={ref}
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      variants={motionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );

  return CardComponent;
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-white mb-2 ${className}`} {...props}>
    {children}
  </h3>
);

/**
 * Card Description Component
 */
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-white/70 text-sm ${className}`} {...props}>
    {children}
  </p>
);

/**
 * Card Content Component
 */
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-white/10 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Preset card components for specific use cases
 */

// Game Mode Card - for selecting game modes
export const GameModeCard = ({ 
  title, 
  description, 
  icon, 
  disabled = false, 
  onClick, 
  className = '',
  ...props 
}) => (
  <Card
    variant="glass"
    clickable={!disabled}
    hover={!disabled}
    onClick={!disabled ? onClick : undefined}
    className={`text-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <CardTitle className="text-center">{title}</CardTitle>
    <CardDescription className="text-center">{description}</CardDescription>
  </Card>
);

// Achievement Card - for displaying achievements
export const AchievementCard = ({ 
  achievement, 
  unlocked = false, 
  progress = null,
  onClick,
  className = '',
  ...props 
}) => (
  <Card
    variant={unlocked ? "achievement" : "default"}
    clickable={!!onClick}
    glow={unlocked}
    className={`${unlocked ? '' : 'opacity-60'} ${className}`}
    onClick={onClick}
    {...props}
  >
    <div className="flex items-start space-x-3">
      <div className="text-2xl flex-shrink-0">{achievement.icon}</div>
      <div className="flex-1 min-w-0">
        <CardTitle className="text-sm mb-1">{achievement.title}</CardTitle>
        <CardDescription className="text-xs mb-2">
          {achievement.description}
        </CardDescription>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            achievement.tier === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
            achievement.tier === 'epic' ? 'bg-purple-500/20 text-purple-300' :
            achievement.tier === 'rare' ? 'bg-blue-500/20 text-blue-300' :
            achievement.tier === 'uncommon' ? 'bg-emerald-500/20 text-emerald-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {achievement.tier}
          </span>
          <span className="text-xs text-primary-400">+{achievement.points}</span>
        </div>
        {progress && (
          <div className="mt-2">
            <div className="bg-white/10 rounded-full h-1.5">
              <div 
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </Card>
);

// Stats Card - for displaying statistics
export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  subtitle = null,
  className = '',
  ...props 
}) => (
  <Card variant="glass" className={className} {...props}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/70 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-white/50 text-xs mt-1">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className="text-primary-400 text-2xl">{icon}</div>
      )}
    </div>
    {trend && (
      <div className={`mt-2 text-xs flex items-center ${
        trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-white/70'
      }`}>
        {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
      </div>
    )}
  </Card>
);

// Leaderboard Card - for leaderboard entries
export const LeaderboardCard = ({ 
  rank, 
  player, 
  score, 
  mode, 
  date, 
  highlighted = false,
  className = '',
  ...props 
}) => {
  const getRankStyle = (rank) => {
    if (rank === 1) return 'text-amber-400 bg-amber-500/20';
    if (rank === 2) return 'text-gray-300 bg-gray-500/20';
    if (rank === 3) return 'text-amber-600 bg-amber-700/20';
    return 'text-white/70 bg-white/10';
  };

  return (
    <Card 
      variant={highlighted ? "gradient" : "glass"} 
      padding="sm"
      className={className}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(rank)}`}>
            {rank}
          </div>
          <div>
            <p className="font-medium text-white">{player}</p>
            <p className="text-xs text-white/70">{mode} • {date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">{score}</p>
        </div>
      </div>
    </Card>
  );
};

export default Card;