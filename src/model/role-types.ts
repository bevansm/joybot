/**
 * A lower number means higher priority.
 * In the case of ties, processed by "first submitted"
 */
type Priority = 1 | 2 | 3 | 4 | 5;

/**
 * A list of alignments in the game.
 */
enum Alignment {
  TOWN = 0,
  MAFIA = 1,
  THIRD_PARTY = 2,
}

/**
 * All supported action types.
 */
enum ActionType {
  HEAL = 'heal',
  KILL = 'kill',
  LK = 'lookout',
  COP = 'cop',
  BD = 'bodydouble',
  RB = 'roleblock',
  TRACK = 'tracker',
  FRAME = 'framer',
}

/**
 * The phase in which an action may occur.
 * By default, night is true, day is false,
 * even and odd are true, and every is set to one.
 */
export interface AllowedPhases {
  night?: boolean;
  day?: boolean;
  even?: boolean;
  odd?: boolean;
  every?: number;
}

export interface Ability {
  type: ActionType;
  phases: AllowedPhases;
  shots?: number;
  numberOfTargets?: number;
  priority: Priority;
}

enum PassiveType {
  IMMUNE_KILL = 'immune_kill',
  IMMUNE_RB = 'immune_rb',
  SILENT = 'ninja',
  STRONG = 'strongman',
  MILLER = 'miller',
  VENG = 'vengful',
  INNO = 'innocent',
}

export interface Passive {
  type: PassiveType;
  shots?: number;
}

/**
 * An informed team will recieve a discord chat link.
 * By default, daychat and deadchat are enabled.
 */
export interface InformedTeam {
  slotIds: number[];
  kill?: boolean;
  daychat?: boolean;
  deadchat?: boolean;
  channel: string;
}

// A role
export interface Role {
  name: string;
  color?: string;

  alignment: Alignment;

  teams?: InformedTeam[];

  concurrentAbilities?: number;
  abilities: Ability[];
  passives: Passive[];
}

export interface UserAction {
  target: number;
}
