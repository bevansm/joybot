import { IGame } from './data-types';

interface IDataclient {
  getGame: (game: string) => Promise<IGame>;
  updateGame: (game: IGame) => Promise<void>;
  getGames: () => Promise<IGame[]>;
}

export default IDataclient;
