import { ISlot, IGame } from '../model/data-types';
import {
  Priority,
  Action,
  InformedTeam,
  ActionType,
  hasPassive,
  PassiveType,
  removePassiveShot,
  FeedbackMessages,
  getHasShots,
  removeShot,
} from '../model/role-types';
import { minBy, merge, last, some } from 'lodash';
import { v1 } from 'uuid';

const padCache = (game: IGame) =>
  game.players.forEach(p => p.actions.cache.push([]));

const hasAction = (slot: ISlot, uuid: string) => {
  const {
    actions: { current },
  } = slot;
  return some(current, a => a.uuid === uuid);
};

const clearSlotActions = (slot: ISlot) =>
  merge(slot, { actions: { current: [] } });

const updateActionTarget = (slot: ISlot, uuid: string, targets: number[]) => {
  for (const s of slot.actions.current) {
    if (s.uuid === uuid) {
      s.targets = targets;
      return;
    }
  }
};

const removeSlotAction = (slot: ISlot, uuid: string) => {
  slot.actions.current = slot.actions.current.filter(a => a.uuid !== uuid);
};

const removeTeamAction = (team: InformedTeam) => merge(team, { action: null });

const cacheAction = (slot: ISlot, action: Action) =>
  last(slot.actions.cache).push(action);

export const addSlotAction = (slot: ISlot, action: Action) => {
  const {
    role: { concurrentTargets },
    actions,
  } = slot;
  if (actions.current.length === concurrentTargets) {
    const { uuid } = minBy(actions.current, a => a.timestamp);
    removeSlotAction(slot, uuid);
  }
};

export const addRoleAction = (
  slot: ISlot,
  targets: number[],
  timestamp: string
): boolean => {
  const hasShots = getHasShots(slot.role.ability);
  if (hasShots)
    addSlotAction(slot, {
      targets,
      timestamp,
      uuid: v1(),
      ability: slot.role.ability,
    });
  return hasShots;
};

export const setTeamAction = (
  team: InformedTeam,
  player: number,
  targets: number,
  timestamp: string
) =>
  merge(team, {
    action: { current: { targets, timestamp, uuid: v1() }, player },
  });

interface MappedAction {
  player: ISlot;
  action: Action;
  priority: Priority;
}

// Maps team actions to slot actions and clean up the team actions, thus updating those slots' actions and resetting the team.
const proccessTeamActions = ({ informedTeams, players }: IGame) =>
  informedTeams.forEach(t => {
    const { ability = null, action: { current, player } = {} } = t;
    if (ability) addSlotAction(players[player], current);
    removeTeamAction(t);
  });

const createActionList = (players: ISlot[]): MappedAction[] => {
  const allActions: MappedAction[] = [];

  // append indivudual
  players.forEach(player => {
    const {
      role: {
        ability: { priority },
      },
      actions: { current },
    } = player;
    current.forEach(action => {
      allActions.push({ action, player, priority });
    });
  });

  // sort the actions in reverse order by priority, and tiebreak by timestamp.
  allActions.sort((a1, a2) => {
    return a2.priority - a1.priority ||
      a1.action.timestamp < a2.action.timestamp
      ? 1
      : -1;
  });

  return allActions;
};

export const resolveActions = (game: IGame) => {
  const { players } = game;
  proccessTeamActions(game);
  const actions = createActionList(players);
  const feedback = new Array(players.length);
  while (actions.length) {
    const {
      player,
      player: { slotNumber: pNo },
      action,
      action: {
        uuid,
        targets,
        ability: { type },
        ability,
      },
    } = actions.pop();

    /**
     * If the player has already had the action negated/ran out of shots, continue.
     * Else, update the ability shots, cache the action, and continue.
     */
    if (!hasAction(player, uuid) || !getHasShots(ability)) continue;
    cacheAction(player, action);
    removeShot(ability);

    const [t1, t2] = targets.map(t => players[t]);
    const [no1, no2] = targets;
    const { role: r1 } = t1 || {};
    const { role: r2 } = t2 || {};
    switch (type) {
      case ActionType.RB:
        if (hasPassive(r1, PassiveType.IMMUNE_RB)) {
          feedback[no1].push(FeedbackMessages.roleblock.strong);
          removePassiveShot(r1, PassiveType.IMMUNE_RB);
        } else {
          feedback[no1].push(FeedbackMessages.roleblock.roleblocked);
          clearSlotActions(t1);
        }
        break;
      case ActionType.WITCH:
        break;
      case ActionType.BD:
        break;
      case ActionType.HEAL:
        break;
      case ActionType.KILL:
        break;
      case ActionType.FRAME:
        break;
      case ActionType.LK:
        break;
      case ActionType.COP:
        break;
      case ActionType.TRACK:
        break;
      case ActionType.INVEST:
        break;
    }
  }
};
