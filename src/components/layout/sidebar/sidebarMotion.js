export const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 40
    }
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 40
    }
  }
};

export const sectionItemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 40
    }
  },
  closed: {
    opacity: 0,
    x: -20
  }
};

export const buildNavItemVariants = (delay = 0) => ({
  open: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 40,
      delay
    }
  },
  closed: {
    opacity: 0,
    x: -20
  }
});
