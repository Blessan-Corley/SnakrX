const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const shouldMirrorProdLogs = import.meta.env.VITE_ENABLE_PROD_CONSOLE === 'true';

let reporter = null;

const getConsoleMethod = (level) => {
  if (typeof console === 'undefined') return null;
  if (typeof console[level] === 'function') return console[level].bind(console);
  if (typeof console.log === 'function') return console.log.bind(console);
  return null;
};

const emitToReporter = (level, args) => {
  if (typeof reporter !== 'function') return;

  try {
    reporter({
      level,
      args,
      timestamp: Date.now()
    });
  } catch (reportError) {
    if (isDev) {
      const warn = getConsoleMethod('warn');
      warn?.('Logger reporter failed:', reportError);
    }
  }
};

const shouldWriteToConsole = (level) => {
  if (isDev || shouldMirrorProdLogs) return true;
  return level === 'error' && typeof reporter !== 'function';
};

const write = (level, ...args) => {
  emitToReporter(level, args);

  if (!shouldWriteToConsole(level)) {
    return;
  }

  const method = getConsoleMethod(level);
  method?.(...args);
};

export const setLoggerReporter = (nextReporter) => {
  reporter = typeof nextReporter === 'function' ? nextReporter : null;
};

export const clearLoggerReporter = () => {
  reporter = null;
};

export const logger = {
  log: (...args) => write('log', ...args),
  info: (...args) => write('info', ...args),
  warn: (...args) => write('warn', ...args),
  error: (...args) => write('error', ...args),
  debug: (...args) => write('debug', ...args)
};

export default logger;
