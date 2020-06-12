import { EntityRoleState, Action } from '../model/role-states';
import { Ability } from '../model/role-types';
import { GamePhase } from '../model/game-types';
import { hasShots } from './manage-shots';

const isValidInPhase = (ability: Ability, phase: GamePhase): boolean => {
  const { type, no } = phase;
  const {
    phases: { types, even, odd },
  } = ability;
  return types.indexOf(type) > -1 && (no % 2 === 0 ? even : odd);
};
const isValidConsecutive = (ability: Ability, cache: Action[][]): boolean => {
  const {
    phases: { every },
    id,
  } = ability;
  if (every <= 1) return true;
  const mappedCache = cache
    .slice(-1 * (every - 1))
    .map(c => c.map(a => a.abilityId));
  return mappedCache.every(cv => cv.indexOf(id) === -1);
};
const hasValidTargetCount = (ability: Ability, action: Action): boolean =>
  action.targets.length % ability.targetsPerShot === 0;

export const timeSortFn = (a: Action, b: Action) =>
  a.timestamp < b.timestamp ? -1 : 1;

export const sortActionsByTime = (ers: EntityRoleState) => {
  const {
    actions: { current },
  } = ers;
  ers.actions.current = current.sort(timeSortFn);
};

// Remove any actions we may deem illicit for this phase, i.e. cannot be performed.
export const filterActions = (
  ers: EntityRoleState,
  abilities: Ability[],
  phase: GamePhase,
  isAlive: boolean = true
) => {
  const {
    actions: { current, cache, abilityShots },
  } = ers;

  // extract the more recent of each action, as action id should be unique
  const unique = Object.values(
    current
      .sort(timeSortFn)
      .reduce((prev, a) => ({ ...prev, [a.abilityId]: a }), {})
  ) as Action[];

  ers.actions.current = unique.filter(a => {
    const ab = abilities.find(ab => ab.id === a.abilityId);
    return (
      ab &&
      isAlive &&
      isValidInPhase(ab, phase) &&
      hasValidTargetCount(ab, a) &&
      hasShots(ab.id, abilityShots) &&
      isValidConsecutive(ab, cache)
    );
  });
};
