import {
  ActionState,
  ShotMap,
  GameRolesState,
  EntityRoleState,
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

export const addAction = (
  ers: EntityRoleState,
  targets: number[],
  abilityId: string
) =>
  ers.actions.current.push({
    targets,
    abilityId,
    timestamp: new Date().toUTCString(),
  });

export const trimCurrentActions = (ers: EntityRoleState, length = 1) => {
  const {
    actions,
    actions: { current },
  } = ers;
  actions.current = current.slice(-1 * length);
};
