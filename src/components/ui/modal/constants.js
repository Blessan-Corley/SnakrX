export const MODAL_SIZES = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full mx-4'
};

export const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const MODAL_VARIANTS = {
  hidden: {
    opacity: 0,
    scale: 0.75,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.75,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};
