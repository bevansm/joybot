import { ISlot } from './../data-types';
import { IGame } from '../data-types';

export interface IPostOptions {
  votecount?: boolean;
  gameInfo?: boolean;
  lynch?: ISlot;
}

interface IPoster {
  post: (game: IGame, options: IPostOptions) => Promise<void>;
}

export default IPoster;
