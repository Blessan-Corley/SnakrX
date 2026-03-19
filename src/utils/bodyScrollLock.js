const activeLocks = new Map();
let previousBodyStyles = null;

const canAccessBody = () => typeof document !== 'undefined' && !!document.body;

const savePreviousBodyStyles = () => {
  if (!canAccessBody() || previousBodyStyles) return;

  previousBodyStyles = {
    overflow: document.body.style.overflow,
    touchAction: document.body.style.touchAction
  };
};

const applyCurrentLocks = () => {
  if (!canAccessBody()) return;

  if (!activeLocks.size) {
    document.body.style.overflow = previousBodyStyles?.overflow || '';
    document.body.style.touchAction = previousBodyStyles?.touchAction || '';
    previousBodyStyles = null;
    return;
  }

  savePreviousBodyStyles();
  document.body.style.overflow = 'hidden';

  const requiresTouchLock = Array.from(activeLocks.values()).some((options) => options?.touchAction === 'none');
  document.body.style.touchAction = requiresTouchLock
    ? 'none'
    : (previousBodyStyles?.touchAction || '');
};

export const acquireBodyScrollLock = (owner, options = {}) => {
  if (!owner || !canAccessBody()) return;

  savePreviousBodyStyles();
  activeLocks.set(owner, {
    touchAction: options.touchAction || ''
  });
  applyCurrentLocks();
};

export const releaseBodyScrollLock = (owner) => {
  if (!owner || !canAccessBody()) return;

  activeLocks.delete(owner);
  applyCurrentLocks();
};

export const __private__ = {
  resetBodyScrollLocks() {
    activeLocks.clear();
    if (!canAccessBody()) {
      previousBodyStyles = null;
      return;
    }

    document.body.style.overflow = previousBodyStyles?.overflow || '';
    document.body.style.touchAction = previousBodyStyles?.touchAction || '';
    previousBodyStyles = null;
  }
};
