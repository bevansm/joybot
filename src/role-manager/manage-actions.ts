import {
  ActionState,
  ShotMap,
  GameRolesState,
  EntityRoleState,
  Action,
  PlayerRoleState,
} from '../model/role-states';
import { last } from 'lodash';

// Mutates the given shot map and removes a shot for the ability with the given id
const removeShot = (id: string, sm: ShotMap) => {
  const shotsLeft = sm[id] || -1;
  if (shotsLeft > 0) sm[id] = shotsLeft - 1;
};

// Mutates the given ActionState and caches the old actions, deducting shots.
// Assumes that current.length is less than the max targets of the player
const cacheActions = (as: ActionState) => {
  const { current, cache, abilityShots } = as;
  current.forEach(a => {
    last(cache).push(a);
    removeShot(a.abilityId, abilityShots);
  });
  as.current = [];
};

const startNextPhaseEntity = (arr: EntityRoleState[]) =>
  arr.forEach(s => {
    const {
      actions,
      actions: { cache },
    } = s;
    cacheActions(actions);
    cache.push([]);
  });

export const startNextPhaseGame = (grs: GameRolesState) => {
  const { roles, teams } = grs;
  startNextPhaseEntity(roles);
  startNextPhaseEntity(teams);
};

export const addAction = (ers: EntityRoleState, action: Action) =>
  ers.actions.current.push(action);

export const addNewAction = (
  ers: EntityRoleState,
  player: number,
  targets: number[],
  abilityId: string
) =>
  addAction(ers, {
    player,
    targets,
    abilityId,
    timestamp: new Date().toUTCString(),
  });

export const addNewRoleAction = (
  ers: PlayerRoleState,
  targets: number[],
  abilityId: string
) => addNewAction(ers, ers.slotNumber, targets, abilityId);

export const removeAction = (ers: EntityRoleState, abilityId: string) => {
  const {
    actions: { current },
  } = ers;
  ers.actions.current = current.filter(a => a.abilityId !== abilityId);
};

export const trimActions = (ers: EntityRoleState, length = 1) => {
  const {
    actions,
    actions: { current },
  } = ers;
  actions.current = current.slice(-1 * length);
};
