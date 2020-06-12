import { Game } from '../model/game-types';
import { GameRolesState, Action, EntityRoleState } from '../model/role-states';
import {
  Role,
  InformedTeam,
  Ability,
  AbilityType,
  PassiveType,
  Feedback,
} from '../model/role-types';
import { getIdFromType, removeShot } from './manage-shots';
import { some, last } from 'lodash';

// hanldes a passive type & returns a boolean if a passive successfully triggered. removes shots.
const handlePassive = (
  state: EntityRoleState,
  role: Role | InformedTeam,
  type: PassiveType
): boolean => {
  const { passives } = role;
  const {
    actions: { passiveShots },
  } = state;

  const passiveId = getIdFromType(
    passives,
    passiveShots,
    PassiveType.IMMUNE_RB
  );

  if (passiveId) removeShot(passiveId, passiveShots);
  return !!passiveId;
};

// Executes a given action and returns if the action was successful or not.
// Removes passive shots as appropriate & sets player state to dead.
export const executeAction = (
  game: Game,
  state: GameRolesState,
  rcs: Role[],
  tRcs: InformedTeam[],
  action: Action,
  abilility: Ability
): boolean => {
  const { players } = game;
  const { roles, teams } = state;

  const { targets, isInvalid, player: playerSlot } = action;
  const { type } = abilility;

  const addVisitorToTarget = (t: number, resolved: boolean = false) =>
    resolved
      ? roles[t].visitors.resolved.push([playerSlot, type])
      : roles[t].visitors.resolved.push([playerSlot, type]);
  const getHasPassive = (t: number, type: PassiveType) =>
    handlePassive(roles[t], rcs[t], type) ||
    some(roles[t].informedTeamNumbers, it =>
      handlePassive(teams[it], tRcs[it], type)
    );

  const isSilent = getHasPassive(playerSlot, PassiveType.SILENT);
  const addFeedbackToTarget = (t: number, feedback: string) =>
    !isSilent && last(roles[t].feedback).push(feedback);
  if (isInvalid) return false;
  switch (type) {
    case AbilityType.RB:
      targets.forEach(t => {
        addVisitorToTarget(t, true);
        const hasPassive =
          getHasPassive(t, PassiveType.IMMUNE_RB) ||
          getHasPassive(t, PassiveType.STRONG);
        if (!hasPassive) {
          roles[t].actions.current.forEach(a => {
            a.isInvalid = true;
          });
          addFeedbackToTarget(t, Feedback.roleblock.default);
        } else addFeedbackToTarget(t, Feedback.roleblock.strong);
      });
      break;
    case AbilityType.WITCH:
      break;
    default:
      break;
  }
  return true;
};
