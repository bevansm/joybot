import axios from 'axios';
import cheerio from 'cheerio';

import { IGame, createGame } from './../models/data-types';
import Dataclient from '../models/Dataclient';
import IDataclient from '../models/IDataclient';
import logger, { Level } from '../logger/Logger';
import Manager from './live-game-jobs-manager';
import manageGameHandler from './manage-game-job';

import { parseGameInfo } from './parsers/parse-title-info';

export const startGameJob = async (
  gameId: string,
  dataclient: IDataclient = Dataclient
): Promise<void> => {
  let game = await dataclient.getGame(gameId);
  if (!game) game = await initGame(gameId);
  if (!game) {
    logger.log(Level.ERROR, `unable to start a cronjob for ${gameId}`, {
      id: gameId,
    });
    return;
  }
  const {
    config: { interval },
    id,
  } = game;
  Manager.createJob(id, `0 */${interval} * * * *`, () => manageGameHandler(id));
};

/**
 * Creates a game and places it in the DB.
 * @param gameId
 */
export const initGame = async (
  gameId: string,
  dataclient: IDataclient = Dataclient
): Promise<IGame> => {
  const baseUrl = `${process.env.FORUM_URL}/viewtopic.php?f=${process.env.GAMES_ID}&t=${gameId}`;
  try {
    const $ = await axios.get(baseUrl).then(res => cheerio.load(res.data));
    const title = $(`a[href="./viewtopic.php?f=17&t=${gameId}"]`).text();
    const game = createGame(gameId, parseGameInfo(title));
    await dataclient.updateGame(game);
    return game;
  } catch (e) {
    logger.log(
      Level.ERROR,
      `unable to create a game entry for ${gameId}: ${e.message}`
    );
    return null;
  }
};

export default startGameJob;
