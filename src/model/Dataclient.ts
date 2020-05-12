import fs from 'fs';
import path from 'path';
import IDataclient from './IDataclient';
import { IGame } from './data-types';
import logger, { Level } from '../logger/Logger';

export const getClient = () => {
  return LocalClient;
};

const LocalClient: IDataclient = {
  getGame: async (id: string) => {
    try {
      const rawData = fs
        .readFileSync(path.resolve(__dirname, `./../../local-db/${id}.json`))
        .toString();
      const game = JSON.parse(rawData);
      logger.log(Level.INFO, 'Retrieving game from local file storage...', {
        game,
        id,
      });
      return game;
    } catch (e) {
      return null;
    }
  },
  updateGame: async (game: IGame) => {
    logger.log(Level.INFO, 'Placing game into local file storage...', { game });
    fs.writeFileSync(
      path.resolve(__dirname, `./../../local-db/${game.id}.json`),
      JSON.stringify(game)
    );
  },
  getGames: async () => {
    try {
      return (fs
        .readdirSync(path.resolve(__dirname, './../../local-db'))
        .map(path =>
          JSON.parse(fs.readFileSync(path).toString())
        ) as unknown) as IGame[];
    } catch (e) {
      return [];
    }
  },
};

// TODO: implement this
// const DynamoClient: IDataclient = {
//   getGame: async () => createMockGame(),
//   updateGame: async () => Promise.resolve(),
//   getGames: async () => [],
// };

export default LocalClient;
