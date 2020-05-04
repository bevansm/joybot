import { merge } from 'lodash';
import { numOrUndefined } from '../helpers';

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
  interval: number;
  autolock: boolean;
  majority: number;
}

export enum GameType {
  VFM = 'VFM',
  SFM = 'SFM',
  TFM = 'TFM',
  CFM = 'CFM',
  GFM = 'GFM',
  EVENT = 'E',
  ALL_STARS = 'ASG',
  EPISODE = 'EP',
  NFM = 'NFM',
  APRILFOOLS = 'AFFM',
  STANDARD = 'STANDARD',
  UNKNOWN = 'UNKNOWN',
}

export interface IGameInfo {
  type: GameType;
  gameNumber: number;
  title: string;
  letter?: string;
}

export interface IThreadLocation {
  page: number;
  post: string;
}

interface IGameMain {
  config: IConfig;
  id: string;
  hosts: IHost[];
  players: ISlot[];
  loc?: IThreadLocation;
}

export type IGame = IGameMain & Partial<IGameInfo>;

export const DefaultLocation: IThreadLocation = {
  page: 0,
  post: '',
};

export const DefaultConfig: IConfig = {
  interval: numOrUndefined(process.env.DEFAULT_VOTECOUNT_TIMEOUT) || 60,
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

export const createSlot = (config?: Partial<ISlot>): ISlot =>
  merge({}, DefaultSlot, { history: [], voting: [], votedBy: [] }, config);

export const createGame = (id: string, info: IGameInfo): IGame =>
  merge(
    {
      id,
      hosts: [],
      players: [],
      config: { ...DefaultConfig },
      loc: { ...DefaultLocation },
    },
    { info }
  );

export const createInfo = (config?: Partial<IGameInfo>): IGameInfo =>
  merge(
    {
      type: GameType.UNKNOWN,
      gameNumber: 0,
      title: '???',
    },
    config
  );

export default DefaultConfig;
