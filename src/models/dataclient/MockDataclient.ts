import { IGame } from './../data-types';
import IDataclient from './IDataclient';

const database: { [key: string]: IGame } = {};

const MockDataclient: IDataclient = {
  getGame: (id: string) => Promise.resolve(database[id]),
  updateGame: (game: IGame) => {
    database[game.id] = game;
    return Promise.resolve();
  },
};

export default MockDataclient;
