import dotenv from 'dotenv';
import express from 'express';

import userHandler from './api/users';
import gamesHandler from './api/games';
import { CronJob } from 'cron';
import checkGamesHandler from './jobs/check-games-job';
import CookieManager from './phpbb-api/CookieManager';

dotenv.config({ path: __dirname + './../.env' });
const app = express();

const runner = async () => {
  await CookieManager.login();

  // TODO: Schedule check-games cron job
  app.get('/v0/users', userHandler);
  app.get('/v1/games', gamesHandler);

  const job = new CronJob('0 */1 * * * *', checkGamesHandler);
  job.start();

  app.listen(80);
};

runner();
