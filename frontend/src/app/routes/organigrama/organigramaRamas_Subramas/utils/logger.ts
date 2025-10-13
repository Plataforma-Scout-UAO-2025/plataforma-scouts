export const logger = {
  debug: (...args: unknown[]) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[organigrama]', ...args);
      }
    } catch (_) {
      // ignore
    }
  },
  info: (...args: unknown[]) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.info('[organigrama]', ...args);
      }
    } catch (_) {
      // ignore
    }
  },
  warn: (...args: unknown[]) => {
    try {
      // eslint-disable-next-line no-console
      console.warn('[organigrama]', ...args);
    } catch (_) {
      // ignore
    }
  },
  error: (...args: unknown[]) => {
    try {
      // eslint-disable-next-line no-console
      console.error('[organigrama]', ...args);
    } catch (_) {
      // ignore
    }
  },
};
