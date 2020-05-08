import { ISlot, IGame } from '../dataclient/data-types';

export interface IPostTokens {
  formToken: string;
  lastPostId: string;
}

export interface IPostOptions {
  votecount?: boolean;
  gameInfo?: boolean;
  lynch?: ISlot;
}

export type IPostConfig = IPostOptions & IPostTokens;

interface IPHPBBApi {
  post: (game: IGame, options: IPostConfig) => Promise<void>;
}

export default IPHPBBApi;
