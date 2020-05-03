export interface ISlot {
  name: string;
  history: string[];
  isAlive: boolean;
  voteWeight: number;
  votesNeeded: number;
  voteablePlayers: number;
}

export interface IHost {
  name: string;
  hex: string;
}

export type IUser = ISlot | IHost;

export interface IConfig {
  interval?: number;
  autolock?: boolean;
  majority: number;
}

type GameType = 'VFM' | 'SFM' | 'EP' | 'NFM' | 'AFFM';

export interface IGame {
  config: IConfig;
  voteCount: { [key: string]: string[] };
  id: string;
  lastVotecount: string;
  type: GameType;
  number: number;
  title: string;
  hosts: IHost[];
  players: ISlot[];
}

export const DefaultConfig: IConfig = {
  interval: 60,
  autolock: false,
  majority: 1,
};

export const DefaultSlot: ISlot = {
  name: '',
  isAlive: true,
  history: null,
  voteWeight: 1,
  votesNeeded: 1,
  voteablePlayers: 1,
};

export default DefaultConfig;
