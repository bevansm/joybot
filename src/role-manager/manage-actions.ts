import {
  ShotMap,
  EntityRoleState,
  Action,
  PlayerRoleState,
} from '../model/role-states';

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
