import { IGame } from './data-types';

interface IDataclient {
  getGame: (game: number) => Promise<IGame>;
  updateGame: (game: IGame) => Promise<void>;
}

export default IDataclient;
