import { merge } from 'lodash';

export interface IVote {
  slotNumber: number;
  weight: number;
}

export interface ISlot {
  name: string;
  slotNumber: number;
  history: string[];
  isAlive: boolean;
  voting: IVote[];
  votedBy: IVote[];
  voteWeight: number;
  canSplitVote: boolean;
  extraVotesToLynch: number;
}

export interface IHost {
  name: string;
  hex: string;
}

export type INamed = ISlot | IHost;

export interface IConfig {
  interval?: number;
  autolock?: boolean;
  majority: number;
}

type GameType = 'VFM' | 'SFM' | 'EP' | 'NFM' | 'AFFM';

interface IGameInfo {
  type: GameType;
  number: number;
  title: string;
}

interface IThreadLocation {
  page: number;
  post: string;
}

export interface IGame {
  config: IConfig;
  id: string;
  hosts: IHost[];
  players: ISlot[];
  info?: IGameInfo;
  loc?: IThreadLocation;
}

const DefaultLocation: IThreadLocation = {
  page: 0,
  post: '',
};

export const DefaultConfig: IConfig = {
  interval: 60,
  autolock: false,
  majority: 1,
};

const DefaultSlot: ISlot = {
  name: '',
  isAlive: true,
  slotNumber: -1,
  voteWeight: 1,
  extraVotesToLynch: 1,
  canSplitVote: false,
  history: null,
  voting: null,
  votedBy: null,
};

export const createDefaultSlot = (config?: Partial<ISlot>): ISlot =>
  merge({}, DefaultSlot, { history: [], voting: [], votedBy: [] }, config);

export const createDefaultGame = (id: string, info: IGameInfo): IGame => ({
  id,
  hosts: [],
  players: [],
  config: { ...DefaultConfig },
  loc: { ...DefaultLocation },
  info: { ...info },
});

export default DefaultConfig;
