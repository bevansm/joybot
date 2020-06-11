import axios from 'axios';
import cheerio from 'cheerio';

import { Game, createGame } from '../model/game-types';
import { getClient } from '../model/dataclient/Dataclient';
import IDataclient from '../model/dataclient/AbstractDataclient';
import logger, { Level } from '../logger/Logger';
import Manager from './live-game-jobs-manager';
import manageGameHandler from './manage-game-job';

import { parseGameInfo } from './parsers/parse-title-info';

export const startGameJob = async (
  gameId: string,
  dataclient: IDataclient = getClient()
): Promise<void> => {
  if (Manager.getJobs().includes(gameId)) return;

  let game = await dataclient.getGame(gameId);
  if (!game) game = await initGame(gameId, dataclient);
  if (!game) {
    logger.log(Level.ERROR, `unable to start a cronjob for ${gameId}`, {
      id: gameId,
    });
    return;
  }

  logger.log(Level.INFO, 'starting a job for a game', game);
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
  dataclient: IDataclient = getClient()
): Promise<Game> => {
  const baseUrl = `${process.env.FORUM_URL}/viewtopic.php?f=${process.env.GAMES_ID}&t=${gameId}`;
  try {
    const $ = await axios.get(baseUrl).then(res => cheerio.load(res.data));
    logger.log(Level.DEBUG, `firt time loading the page for ${gameId}`, {
      baseUrl,
      gameId,
    });
    const title = $(
      `a[href="./viewtopic.php?f=${process.env.GAMES_ID}&t=${gameId}"]`
    ).text();
    logger.log(Level.DEBUG, `successfully found title for ${gameId}`, {
      baseUrl,
      gameId,
      title,
    });
    const game = createGame(gameId, parseGameInfo(title));
    await dataclient.setGame(game);
    return game;
  } catch (e) {
    logger.log(
      Level.ERROR,
      `unable to create a game entry for ${gameId}: ${e.message}`,
      { error: e, gameId }
    );
    return null;
  }
};

export default startGameJob;
