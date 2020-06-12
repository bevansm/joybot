import {
  Role,
  InformedTeam,
  Ability,
  Passive,
  AbilityType,
} from './role-types';

export interface Action {
  player: number;
  targets: number[];
  timestamp: string;
  abilityId: string;
  isInvalid?: boolean;
}

export type ShotMap = { [key: string]: number };

export interface ActionState {
  current: Action[];
  targetedBy: Array<[number, AbilityType]>;
  cache: Action[][];
  abilityShots: ShotMap;
  passiveShots: ShotMap;
}

export interface VisitorState {
  pending: Array<[number, AbilityType]>;
  resolved: Array<[number, AbilityType]>;
  cache: number[][];
}

export interface EntityRoleState {
  id: string;
  actions: ActionState;
  feedback: string[][];
}

export interface PlayerRoleState extends EntityRoleState {
  slotNumber: number;
  informedTeamNumbers: number[];
  visitors: VisitorState;
}

export interface TeamRoleState extends EntityRoleState {
  slotNumbers: number[];
}

export interface GameRolesState {
  id: string;
  roles: PlayerRoleState[];
  teams: TeamRoleState[];
}

const mapToShots = (arr: Array<Ability | Passive>): ShotMap =>
  arr.reduce((prev, a) => ({ ...prev, [a.id]: a.shots }), {});

const createActionState = (seed: Role | InformedTeam): ActionState => {
  const { abilities, passives = [] } = seed as Role;
  return {
    current: [],
    cache: [],
    targetedBy: [],
    abilityShots: mapToShots(abilities),
    passiveShots: mapToShots(passives),
  };
};

const createVisitorState = (): VisitorState => ({
  pending: [],
  resolved: [],
  cache: [],
});

export const createRoleState = (
  id: string,
  roles: Role[],
  teams: Array<{ slotNumbers: number[]; team: InformedTeam }> = []
): GameRolesState => {
  return {
    id,
    roles: roles.map((r, slotNumber) => ({
      slotNumber,
      informedTeamNumbers: teams.reduce(
        (prev, { slotNumbers }, i) =>
          slotNumbers.indexOf(slotNumber) > -1 ? prev.concat(i) : prev,
        []
      ),
      feedback: [],
      visitors: createVisitorState(),
      actions: createActionState(r),
      id: r.id,
    })),
    teams: teams.map(({ slotNumbers, team }) => ({
      slotNumbers,
      feedback: [],
      id: team.id,
      actions: createActionState(team),
    })),
  };
};
