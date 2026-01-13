/**
 * Validation facade.
 * Keeps legacy imports stable while implementation is split into focused modules.
 */
import { validators } from './validation/validators.js';
import { rateLimiters } from './validation/rateLimiters.js';
import { validateInput } from './validation/validateInput.js';
import { security } from './validation/security.js';

export {
  validators,
  rateLimiters,
  validateInput,
  security
};

export default {
  validators,
  rateLimiters,
  validateInput,
  security
};
