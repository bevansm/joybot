import { some, merge } from 'lodash';

/**
 * A lower number means higher priority.
 * In the case of ties, processed by "first submitted"
 * A priorty of 0 is regarded as a "no action" priority.
 */
export type Priority = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * A list of alignments in the game.
 */
enum Alignment {
  TOWN = 0,
  MAFIA = 1,
  THIRD_PARTY = 2,
}

/**
 * All feedback messages.
 */
export const FeedbackMessages = {
  attack: {
    immune: 'You were attached last night, but you were immune!',
    healed: 'You were attacked last night, but a player healed you!',
    failed: 'Your attack failed last night.',
  },
  roleblock: {
    roleblocked: 'You were roleblocked.',
    strong:
      'You were roleblocked, but due to your strength, your action(s) still succeeded!',
  },
  bodydouble: 'You were attacked last night, but a player saved you!',
  cop: "Your target's alignment is: ",
  killed: 'You killed a player!',
};

/**
 * All supported action types.
 */
export enum ActionType {
  HEAL = 'heal',
  KILL = 'kill',
  LK = 'lookout',
  COP = 'cop',
  BD = 'bodydouble',
  RB = 'roleblock',
  TRACK = 'tracker',
  FRAME = 'framer',
  INVEST = 'investigate',
  WITCH = 'redirect',
}

/**
 * The phase in which an action may occur.
 * By default, night is true, day is false,
 * even and odd are true, and every is set to one.
 */
export interface AllowedPhases {
  night: boolean;
  day: boolean;
  even: boolean;
  odd: boolean;
  every: number;
}

/**
 * An ability.
 * By default, shots is -1 (unlimited) and priority is 5.
 */
export interface Ability {
  type: ActionType;
  phases: AllowedPhases;
  shots: number;
  priority: Priority;
}

export enum PassiveType {
  IMMUNE_KILL = 'immune_kill',
  IMMUNE_RB = 'immune_rb',
  SILENT = 'ninja',
  STRONG = 'strongman',
  MILLER = 'miller',
  VENG = 'vengful',
  INNO = 'innocent',
}

/**
 * A role passive.
 * By default, shots is -1 (unlimited)
 */
export interface Passive {
  type: PassiveType;
  shots: number;
}

export interface Action {
  uuid: string;
  targets: number[];
  timestamp: string;
  ability: Ability;
}

/**
 * An informed team will recieve a discord chat link.
 * By default, daychat and deadchat are enabled.
 */
export interface InformedTeam {
  slotIds: number[];
  daychat: boolean;
  deadchat: boolean;
  channelID: string;
  ability?: Ability;
  action?: {
    current: Action;
    player: number;
  };
}

// A role
export interface Role {
  name: string;
  color: string;
  alignment: Alignment;
  concurrentTargets: number;
  ability: Ability;
  passives: Passive[];
}

// returns true iif a role has a passive and/or has shots remaining
export const hasPassive = (role: Role, type: PassiveType): boolean =>
  some(role.passives, p => p.type === type && getHasShots(p));

export const removePassiveShot = (role: Role, type: PassiveType) =>
  role.passives.forEach(p => p.type === type && removeShot(p));

export const getHasShots = (s: { shots: number }) =>
  s.shots === -1 || !!s.shots;

export const removeShot = (s: { shots: number }) =>
  merge(s, { shots: !s.shots || s.shots === -1 ? -1 : s.shots - 1 });
