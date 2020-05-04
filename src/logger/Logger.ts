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
    console.log(JSON.stringify(log));
  },
};

export default Logger;
