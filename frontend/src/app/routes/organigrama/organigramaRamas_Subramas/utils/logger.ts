export const logger = {
  debug: (...args: unknown[]) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[organigrama]', ...args);
      }
    } catch (_) {
    }
  },
  info: (...args: unknown[]) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[organigrama]', ...args);
      }
    } catch (_) {
    }
  },
  warn: (...args: unknown[]) => {
    try {
      console.warn('[organigrama]', ...args);
    } catch (_) {
    }
  },
  error: (...args: unknown[]) => {
    try {
      console.error('[organigrama]', ...args);
    } catch (_) {
    }
  },
};
