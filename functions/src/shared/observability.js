const { functions } = require('../runtime');

const sanitizeMeta = (meta = {}) =>
  Object.fromEntries(
    Object.entries(meta).map(([key, value]) => {
      if (value == null) {
        return [key, null];
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return [key, value];
      }

      return [key, JSON.stringify(value)];
    })
  );

const logCallableError = (operation, error, meta = {}) => {
  functions.logger.error(`${operation} failed`, {
    operation,
    code: error?.code || null,
    message: error?.message || 'unknown-error',
    ...sanitizeMeta(meta)
  });
};

const logCallableInfo = (operation, meta = {}) => {
  functions.logger.info(`${operation} completed`, {
    operation,
    ...sanitizeMeta(meta)
  });
};

module.exports = {
  logCallableError,
  logCallableInfo
};
