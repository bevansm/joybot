import { Slot, Game } from '../model/game-types';

export interface IPostConfig {
  votecount?: boolean;
  gameInfo?: boolean;
  lynch?: Slot;
}

interface IPHPBBApi {
  post: (game: Game, options: IPostConfig) => Promise<void>;
}

export default IPHPBBApi;
