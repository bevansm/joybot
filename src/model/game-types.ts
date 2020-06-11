import { merge } from 'lodash';
import { numOrUndefined } from '../utils/format-utils';

export interface Vote {
  slotNumber: number;
  weight: number;
}

export interface Slot {
  name: string;
  slotNumber: number;
  history: string[];
  isAlive: boolean;
  voting: Vote[];
  votedBy: Vote[];
  voteWeight: number;
  canSplitVote: boolean;
  extraVotesToLynch: number;
}

export interface Host {
  name: string;
  hex: string;
}

export type Named = Slot | Host;

export interface Config {
  interval: number;
  autolock: boolean;
  majority: number;
  enabled: boolean;
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

export enum GamePhaseType {
  NIGHT = 'night',
  DAY = 'day',
  PRE = 'pregame',
  POST = 'postgame',
}

export interface GamePhase {
  type: GamePhaseType;
  no: number;
}

export interface GameInfo {
  type: GameType;
  gameNumber: number;
  title: string;
  letter?: string;
}

interface GameMain {
  config: Config;
  id: string;
  hosts: Host[];
  players: Slot[];
  lastPost: string;
  phase: GamePhase;
}

export type Game = GameMain & Partial<GameInfo>;

const getInterval = () =>
  numOrUndefined(process.env.DEFAULT_VOTECOUNT_TIMEOUT) || 60;
export const DefaultConfig: Config = {
  interval: getInterval(),
  autolock: false,
  majority: 1,
  enabled: true,
};

const DefaultSlot: Slot = {
  name: '',
  isAlive: true,
  slotNumber: -1,
  voteWeight: 1,
  extraVotesToLynch: 0,
  canSplitVote: false,
  history: null,
  voting: null,
  votedBy: null,
};

export const createSlot = (config?: Partial<Slot>): Slot =>
  merge({}, DefaultSlot, { history: [], voting: [], votedBy: [] }, config);

export const createGame = (id: string, info: GameInfo): Game =>
  merge(
    {
      id,
      hosts: [],
      players: [],
      config: { ...DefaultConfig, interval: getInterval() },
      lastPost: '0',
      phase: {
        type: GamePhaseType.PRE,
        no: 0,
      },
    },
    { ...info }
  );

export const createInfo = (config?: Partial<GameInfo>): GameInfo =>
  merge(
    {
      type: GameType.UNKNOWN,
      gameNumber: 0,
      title: '???',
    },
    config
  );

export default DefaultConfig;
