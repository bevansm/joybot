import { IGame } from './data-types';

interface IDatabase {
  getGame: (game: number) => Promise<void>;
  updateGame: (game: IGame) => Promise<void>;
}
