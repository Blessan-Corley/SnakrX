import { forwardRef } from 'react';
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
  userStats = null,
  onClick,
  className = '',
  ...props 
}) => {
  // Calculate detailed progress information
  const getProgressDetails = () => {
    if (unlocked || !achievement.requirements || !userStats) {
      return null;
    }

    const requirements = achievement.requirements;
    const reqKeys = Object.keys(requirements);
    
    if (reqKeys.length === 0) return null;

    // For single requirement
    if (reqKeys.length === 1) {
      const key = reqKeys[0];
      const current = userStats[key] || 0;
      const target = requirements[key];
      const percentage = Math.min(100, Math.round((current / target) * 100));
      
      return {
        type: 'single',
        current,
        target,
        percentage,
        description: getRequirementDescription(key, current, target)
      };
    }

    // For multiple requirements - show overall progress
    let totalProgress = 0;
    reqKeys.forEach(key => {
      const current = userStats[key] || 0;
      const target = requirements[key];
      totalProgress += Math.min(100, (current / target) * 100);
    });
    
    const overallPercentage = Math.round(totalProgress / reqKeys.length);
    
    return {
      type: 'multiple',
      percentage: overallPercentage,
      requirements: reqKeys.map(key => ({
        key,
        current: userStats[key] || 0,
        target: requirements[key],
        percentage: Math.min(100, Math.round(((userStats[key] || 0) / requirements[key]) * 100))
      }))
    };
  };

  const getRequirementDescription = (key) => {
    const mappings = {
      games: 'games played',
      wins: 'games won',
      totalScore: 'total points',
      singleScore: 'points in one game',
      survivalTime: 'seconds survived',
      maxSpeed: 'speed multiplier',
      foodEaten: 'food consumed',
      wallHits: 'wall collisions',
      selfHits: 'self collisions',
      aiWins: 'AI victories',
      multiplayerWins: 'multiplayer wins',
      winStreak: 'win streak'
    };
    
    return mappings[key] || key;
  };

  const progressDetails = getProgressDetails();
  const displayProgress = progress !== null ? progress : progressDetails?.percentage || 0;

  return (
    <Card
      variant={unlocked ? "achievement" : "default"}
      clickable={!!onClick}
      glow={unlocked}
      className={`${unlocked ? '' : 'opacity-70'} ${className} transition-all duration-300`}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0 relative">
          {achievement.icon}
          {unlocked && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className={`text-sm mb-1 ${unlocked ? 'text-emerald-300' : 'text-white'}`}>
            {achievement.title}
          </CardTitle>
          <CardDescription className="text-xs mb-2 line-clamp-2">
            {achievement.description}
          </CardDescription>
          
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              achievement.tier === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              achievement.tier === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
              achievement.tier === 'rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              achievement.tier === 'uncommon' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {achievement.tier}
            </span>
            <span className="text-xs text-primary-400 font-medium">+{achievement.points}pts</span>
          </div>

          {!unlocked && progressDetails && (
            <div className="mt-2 space-y-2">
              <div className="relative">
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      displayProgress >= 100 ? 'bg-emerald-500' :
                      displayProgress >= 75 ? 'bg-blue-500' :
                      displayProgress >= 50 ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, displayProgress)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">
                  {progressDetails.type === 'single' ? (
                    progressDetails.description
                  ) : (
                    'Overall Progress'
                  )}
                </span>
                <span className={`font-medium ${
                  displayProgress >= 100 ? 'text-emerald-400' :
                  displayProgress >= 75 ? 'text-blue-400' :
                  displayProgress >= 50 ? 'text-yellow-400' :
                  'text-white/70'
                }`}>
                  {progressDetails.type === 'single' ? (
                    `${progressDetails.current}/${progressDetails.target}`
                  ) : (
                    `${Math.round(displayProgress)}%`
                  )}
                </span>
              </div>
            </div>
          )}

          {unlocked && (
            <div className="mt-2 flex items-center text-xs text-emerald-400">
              <span>✓ Unlocked</span>
              {achievement.unlockedAt && (
                <span className="ml-2 text-white/50">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

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