import { motion } from 'framer-motion';

const sizeClasses = {
  sm: {
    mark: 'w-8 h-8 rounded-lg',
    image: 'w-5 h-5',
    title: 'text-lg',
    subtitle: 'text-[11px]'
  },
  md: {
    mark: 'w-10 h-10 rounded-xl',
    image: 'w-6 h-6',
    title: 'text-xl',
    subtitle: 'text-xs'
  },
  lg: {
    mark: 'w-16 h-16 rounded-2xl',
    image: 'w-10 h-10',
    title: 'text-3xl',
    subtitle: 'text-sm'
  },
  xl: {
    mark: 'w-20 h-20 rounded-3xl',
    image: 'w-12 h-12',
    title: 'text-4xl',
    subtitle: 'text-base'
  }
};

const SnakrXLogo = ({
  size = 'md',
  subtitle = 'Gaming Experience',
  showSubtitle = true,
  showTitle = true,
  titleClassName = '',
  subtitleClassName = '',
  className = '',
  markClassName = '',
  rotateOnHover = false,
  useGradientTitle = true
}) => {
  const config = sizeClasses[size] || sizeClasses.md;
  const MarkWrapper = rotateOnHover ? motion.div : 'div';
  const markProps = rotateOnHover
    ? {
        whileHover: { rotate: 360 },
        transition: { duration: 0.6 }
      }
    : {};

  return (
    <div className={`flex items-center space-x-3 ${className}`.trim()}>
      <MarkWrapper
        {...markProps}
        className={`flex items-center justify-center bg-white/10 border border-white/10 shadow-lg shadow-black/10 ${config.mark} ${markClassName}`.trim()}
      >
        <img
          src="/favicon.svg"
          alt="SnakrX logo"
          className={`${config.image} object-contain`}
        />
      </MarkWrapper>

      {(showTitle || showSubtitle) && (
        <div>
          {showTitle && (
            <div
              className={`font-bold ${config.title} ${useGradientTitle ? 'bg-gradient-sunset bg-clip-text text-transparent' : 'text-white'} ${titleClassName}`.trim()}
            >
              SnakrX
            </div>
          )}
          {showSubtitle && (
          <p className={`leading-none text-white/50 ${config.subtitle} ${subtitleClassName}`.trim()}>
            {subtitle}
          </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SnakrXLogo;
