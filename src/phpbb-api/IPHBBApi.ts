import { ISlot, IGame } from '../models/data-types';

export interface IPostOptions {
  votecount?: boolean;
  gameInfo?: boolean;
  lynch?: ISlot;
}

interface IPHPBBApi {
  post: (game: IGame, options: IPostOptions) => Promise<void>;
}

export default IPHPBBApi;
