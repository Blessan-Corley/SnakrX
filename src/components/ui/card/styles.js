export const CARD_VARIANTS = {
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
    base: 'bg-gradient-to-r from-slate-800/95 via-slate-700/90 to-slate-800/95 border border-white/15 backdrop-blur-md',
    hover: 'hover:shadow-card-hover hover:border-white/25'
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

export const CARD_PADDINGS = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

export const CARD_MOTION_VARIANTS = (interactive) => ({
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
  hover: interactive ? { scale: 1.02, y: -2 } : {}
});

export const buildCardClassName = ({
  variant,
  padding,
  hover,
  clickable,
  disabled,
  gradient,
  glow,
  className
}) => {
  const variantStyles = CARD_VARIANTS[variant] || CARD_VARIANTS.default;
  const paddingStyles = CARD_PADDINGS[padding] || CARD_PADDINGS.md;

  return [
    'rounded-xl transition-all duration-300',
    paddingStyles,
    variantStyles.base,
    hover && !clickable ? variantStyles.hover : '',
    clickable && !disabled ? `cursor-pointer ${variantStyles.hover} transform hover:scale-[1.02] active:scale-[0.98]` : '',
    clickable && disabled ? 'cursor-not-allowed opacity-70' : '',
    glow ? 'shadow-glow' : 'shadow-card',
    gradient ? 'animate-gradient bg-gradient-to-r from-slate-800/95 via-slate-700/90 to-slate-800/95' : '',
    className
  ].filter(Boolean).join(' ');
};
