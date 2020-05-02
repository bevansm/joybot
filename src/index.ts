import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';

import userHandler from './routes/users';
import gamesHandler from './routes/games';

const app = express();

app.get('/v0/users', userHandler);
app.get('/v1/games', gamesHandler);

app.listen(8888);

axios
  .get('https://www.phpbb.com/community/viewtopic.php?f=456&t=2400921&start=30')
  .then(res => {
    const $ = cheerio.load(res.data);
    console.log($('div.post').get().length);
  });
