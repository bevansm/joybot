import { Role, InformedTeam, Ability, Passive } from './role-types';

export interface Action {
  targets: number[];
  timestamp: string;
  abilityId: string;
}

export type ShotMap = { [key: string]: number };

export interface ActionState {
  current: Action[];
  cache: Action[][];
  feedback: string[];
  abilityShots: ShotMap;
  passiveShots: ShotMap;
}

export interface EntityRoleState {
  id: string;
  actions: ActionState;
}

export interface PlayerRoleState extends EntityRoleState {
  slotNumber: number;
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
    feedback: [],

    abilityShots: mapToShots(abilities),
    passiveShots: mapToShots(passives),
  };
};

export const createRoleState = (
  id: string,
  roles: Role[],
  teams: Array<{ slotNumbers: number[]; team: InformedTeam }> = []
): GameRolesState => {
  return {
    id,
    roles: roles.map((r, slotNumber) => ({
      slotNumber,
      actions: createActionState(r),
      id: r.id,
    })),
    teams: teams.map(({ slotNumbers, team }) => ({
      slotNumbers,
      id: team.id,
      actions: createActionState(team),
    })),
  };
};
