import { createConsola } from 'consola';

const isDevelopment = import.meta.env.DEV;

export const logger = createConsola({
  level: isDevelopment ? 4 : 3, // debug in dev, info in production
  formatOptions: {
    date: true,
    colors: true,
  },
});

