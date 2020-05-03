import dotenv from 'dotenv';
import express from 'express';

import userHandler from './api/users';
import gamesHandler from './api/games';

dotenv.config();
const app = express();

app.get('/v0/users', userHandler);
app.get('/v1/games', gamesHandler);

app.listen(8888);
