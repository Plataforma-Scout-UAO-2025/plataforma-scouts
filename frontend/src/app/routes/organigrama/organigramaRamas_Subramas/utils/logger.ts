export const logger = {
  debug: (...args: unknown[]) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[organigrama]', ...args);
      }
    } catch (_err) {
      console.debug('logger.debug failed', _err);
    }
  },
  info: (...args: unknown[]) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[organigrama]', ...args);
      }
    } catch (_err) {
      console.debug('logger.info failed', _err);
    }
  },
  warn: (...args: unknown[]) => {
    try {
      console.warn('[organigrama]', ...args);
    } catch (_err) {
      console.debug('logger.warn failed', _err);
    }
  },
  error: (...args: unknown[]) => {
    try {
      console.error('[organigrama]', ...args);
    } catch (_err) {
      console.debug('logger.error failed', _err);
    }
  },
};