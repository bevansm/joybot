import { IGame } from './data-types';

interface IDataclient {
  getGame: (game: string) => Promise<IGame>;
  updateGame: (game: IGame) => Promise<void>;
}

export default IDataclient;
