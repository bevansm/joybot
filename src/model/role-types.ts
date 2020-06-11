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

interface Flavored {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}

/**
 * An ability.
 * By default, shots is -1 (unlimited)
 */
export interface Ability extends Flavored {
  type: ActionType;
  phases: AllowedPhases;
  shots: number;
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
export interface Passive extends Flavored {
  type: PassiveType;
  shots: number;
}

/**
 * An informed team will recieve a discord chat link.
 * By default, daychat and deadchat are enabled.
 */
export interface InformedTeam extends Flavored {
  daychat: boolean;
  deadchat: boolean;
  abilities: Ability[];
  passives: Passive[];
}

// A role
export interface Role extends Flavored {
  alignment: Alignment;
  concurrentTargets: number;
  abilities: Ability[];
  passives: Passive[];
}
