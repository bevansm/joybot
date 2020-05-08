import { IGame } from './data-types';
import IDataclient from './IDataclient';

const database: { [key: string]: IGame } = {};

const MockDataclient: IDataclient = {
  getGame: async (id: string) => database[id],
  updateGame: async (game: IGame) => {
    database[game.id] = game;
  },
  getGames: async () => Object.values(database),
};

export default MockDataclient;
