export enum Level {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

const Logger = {
  log: (level: Level, message: string, info?: object) => {
    const log = {
      level,
      message,
      ...info,
      timestamp: new Date().toISOString(),
    };
    if (
      process.env.NODE_ENV === 'prod' &&
      (level === Level.ERROR || level === Level.INFO)
    ) {
      // TODO: Do prod logging
      console.log(JSON.stringify(log));
    } else if (process.env.NODE_ENV === 'dev') {
      console.log(JSON.stringify(log));
    }
  },
};

export default Logger;
