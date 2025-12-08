type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const isDevelopment = import.meta.env.DEV;

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (!isDevelopment && level === 'debug') {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'error':
      console.error(prefix, message, ...args);
      break;
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    case 'info':
      console.info(prefix, message, ...args);
      break;
    case 'debug':
      console.debug(prefix, message, ...args);
      break;
  }
}

export const logger = {
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
};

