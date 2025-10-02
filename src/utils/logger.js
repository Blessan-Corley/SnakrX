/**
 * SnakrX Logger Utility
 * Environment-based logging to prevent console clutter in production
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  warn: (...args) => {
    if (isDev) console.warn(...args);
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },

  debug: (...args) => {
    if (isDev) console.debug(...args);
  },

  info: (...args) => {
    if (isDev) console.info(...args);
  },

  group: (label) => {
    if (isDev) console.group(label);
  },

  groupEnd: () => {
    if (isDev) console.groupEnd();
  },

  table: (data) => {
    if (isDev) console.table(data);
  }
};

export default logger;
