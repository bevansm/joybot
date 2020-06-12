import { last } from 'lodash';

import {
  GameRolesState,
  Action,
  PlayerRoleState,
  TeamRoleState,
  ActionState,
  EntityRoleState,
  VisitorState,
} from '../model/role-states';
import { Game } from '../model/game-types';
import Dataclient from '../model/dataclient/Dataclient';
import { addAction, trimActions } from './manage-actions';
import { filterActions, sortActionsByTime } from './filter-actions';
import {
  Ability,
  InformedTeam,
  Role,
  AbilityType,
  orderedActions,
} from '../model/role-types';
import { removeShot } from './manage-shots';
import { executeAction } from './execute-actions';

// Mutates the given ActionState and caches the old actions, deducting shots.
// Assumes that current.length is less than the max targets of the player
const cacheActions = (as: ActionState) => {
  const { current, cache, abilityShots } = as;
  current.forEach(a => {
    if (!a.isInvalid) {
      last(cache).push(a);
      removeShot(a.abilityId, abilityShots);
    }
  });
  as.current = [];
};

const cacheVisitors = (visitors: VisitorState) => {
  const {
    resolved: resolvedEffects,
    pending: pendingEffects,
    cache,
  } = visitors;
  resolvedEffects.forEach(es => last(cache).push(es[0]));
  pendingEffects.forEach(es => last(cache).push(es[0]));
  visitors.resolved = [];
  visitors.pending = [];
};

const startNextEntityPhase = (arr: EntityRoleState[]) =>
  arr.forEach(s => {
    const {
      actions,
      actions: { cache },
      feedback = [],
      // @ts-ignore
      visitors = null,
      // @ts-ignore
      visitors: { cache: vCache } = { cache: [] },
    } = s;
    feedback.push([]);
    cacheActions(actions);
    cache.push([]);

    if (visitors) {
      cacheVisitors(visitors);
      vCache.push([]);
    }
  });

export const startNextGamePhase = (grs: GameRolesState) => {
  const { roles, teams } = grs;
  startNextEntityPhase(roles);
  startNextEntityPhase(teams);
};

/**
 * Preprocesses the player actions, removing invalid actions and appending team actions
 * onto appropriate player actions.
 * @param rsArr - The array of player states
 * @param tiArr - The array of team states
 * @param rcs - An array of player rolecards, where rcs[i] corresponds to rsArr[i]
 * @param tRcs - An array of team rolecards, where tRcs[i] corresponds to tiArr[i]
 * @param phase - The current game phase (used in some validity checks)
 */
const preProcessActions = (
  rsArr: PlayerRoleState[],
  tiArr: TeamRoleState[],
  rcs: Role[],
  tRcs: InformedTeam[],
  game: Game
) => {
  const { phase, players } = game;
  rsArr.forEach((r, i) =>
    filterActions(r, rcs[i].abilities, phase, players[i].isAlive)
  );
  tiArr.forEach((t, i) => {
    filterActions(t, tRcs[i].abilities, phase);
    t.actions.current.forEach(a => addAction(rsArr[a.player], a));
    t.actions.current = [];
  });
  rsArr.forEach((r, i) => {
    sortActionsByTime(r);
    trimActions(r, rcs[i].concurrentTargets);
  });
};

type TypeMapEntry = {
  ability: Ability;
  action: Action;
};

// creates a map of actions by ability type to the appropriate action id & associated action
// orders actions by timestamp w/in each array
const mapByActionType = (
  rsArr: PlayerRoleState[],
  rcs: Role[],
  tRcs: InformedTeam[]
): Map<AbilityType, TypeMapEntry[]> => {
  const abilityMap: { [key: string]: Ability } = {};
  rcs.forEach(r => r.abilities.forEach(a => (abilityMap[a.id] = a)));
  tRcs.forEach(r => r.abilities.forEach(a => (abilityMap[a.id] = a)));

  const byType: Map<AbilityType, TypeMapEntry[]> = new Map();
  rsArr.forEach(r =>
    r.actions.current.forEach(action => {
      const { abilityId: id } = action;
      const ability = abilityMap[id];
      const typeArr = byType.get(ability.type);

      if (typeArr) typeArr.push({ action, ability });
      else byType.set(ability.type, [{ action, ability }]);
    })
  );
  Object.entries(byType).map(([id, v]) => {
    byType.set(
      id as AbilityType,
      (v as TypeMapEntry[]).sort((a, b) =>
        a.action.timestamp < b.action.timestamp ? -1 : 1
      )
    );
  });
  return byType;
};

export const executePhaseActions = (
  game: Game,
  state: GameRolesState,
  rcs: Role[],
  tRcs: InformedTeam[],
  actionsByType: Map<AbilityType, TypeMapEntry[]>
) =>
  orderedActions.forEach(
    type =>
      actionsByType.has(type) &&
      actionsByType
        .get(type)
        .forEach(({ action, ability }) =>
          executeAction(game, state, rcs, tRcs, action, ability)
        )
  );

export const handlePhase = async (
  game: Game,
  state: GameRolesState,
  dc = Dataclient
) => {
  const { roles, teams } = state;
  const { phase } = game;

  const rcs = await Promise.all(dc.getRoles(roles.map(r => r.id)));
  const tRcs = await Promise.all(dc.getTeams(teams.map(t => t.id)));

  preProcessActions(roles, teams, rcs, tRcs, game);
  const byType = mapByActionType(roles, rcs, tRcs);
  executePhaseActions(game, state, rcs, tRcs, byType);
  roles.forEach(r => cacheActions(r.actions));
};
