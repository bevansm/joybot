import dotenv from 'dotenv';
import express from 'express';

import userHandler from './api/users';
import gamesHandler from './api/games';

import CookieManager from './phpbb-api/CookieManager';

dotenv.config();
const app = express();

const runner = async () => {
  await CookieManager.login();

  // TODO: Schedule check-games cron job
  app.get('/v0/users', userHandler);
  app.get('/v1/games', gamesHandler);

  app.listen(8888);
};

runner();
