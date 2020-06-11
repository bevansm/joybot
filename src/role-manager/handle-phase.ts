import {
  GameRolesState,
  Action,
  PlayerRoleState,
  TeamRoleState,
} from '../model/role-states';
import { Game, GamePhase } from '../model/game-types';
import Dataclient from '../model/dataclient/Dataclient';
import { addAction, trimActions } from './manage-actions';
import { filterActions, sortActionsByTime } from './filter-actions';
import { Ability, InformedTeam, Role, AbilityType } from '../model/role-types';

const preprocessActions = (
  rsArr: PlayerRoleState[],
  tiArr: TeamRoleState[],
  rcs: Role[],
  tRcs: InformedTeam[],
  phase: GamePhase
) => {
  // remove actions of any players/teams who cannot act this phase
  // & reduces to the most recent action
  rsArr.forEach(r => filterActions(r, rcs[r.slotNumber].abilities, phase));

  // reduce team actions && append onto individual role histories
  tiArr.forEach((t, i) => {
    filterActions(t, tRcs[i].abilities, phase);
    t.actions.current.forEach(a => addAction(rsArr[a.player], a));
  });

  // trim down actions to max concurrent actions
  rsArr.forEach(r => {
    sortActionsByTime(r);
    trimActions(r, rcs[r.slotNumber].concurrentTargets);
  });
};

// creates a mpa of actions by ability type to the appropriate action id & associated action
const mapByActionType = (
  rsArr: PlayerRoleState[],
  rcs: Role[],
  tRcs: InformedTeam[]
): Map<
  AbilityType,
  Array<{
    ability: Ability;
    action: Action;
  }>
> => {
  const abilityMap: { [key: string]: Ability } = {};
  rcs.forEach(r => r.abilities.forEach(a => (abilityMap[a.id] = a)));
  tRcs.forEach(r => r.abilities.forEach(a => (abilityMap[a.id] = a)));

  const byType: Map<
    AbilityType,
    Array<{
      ability: Ability;
      action: Action;
    }>
  > = new Map();
  rsArr.forEach(r =>
    r.actions.current.forEach(action => {
      const { abilityId: id } = action;
      const ability = abilityMap[id];
      const typeArr = byType.get(ability.type);

      if (typeArr) typeArr.push({ action, ability });
      else byType.set(ability.type, [{ action, ability }]);
    })
  );
  return byType;
};

export const handlePhase = async (
  game: Game,
  state: GameRolesState,
  dc = Dataclient
) => {
  const { roles, teams } = state;
  const { phase } = game;

  const rcs = await Promise.all(dc.getRoles(roles.map(r => r.id)));
  const tRcs = await Promise.all(dc.getTeams(teams.map(t => t.id)));

  preprocessActions(roles, teams, rcs, tRcs, phase);
  const byType = mapByActionType(roles, rcs, tRcs);

  // now start to process the actions!
  // first handle roleblocks
};
