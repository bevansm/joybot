import { ShotMap } from '../model/role-states';
import {
  AbilityType,
  PassiveType,
  Passive,
  Ability,
} from '../model/role-types';

// Mutates the given shot map and removes a shot for the ability with the given id
export const removeShot = (id: string, sm: ShotMap) => {
  const shotsLeft = sm[id] || -1;
  if (shotsLeft > 0) sm[id] = shotsLeft - 1;
};

// Returns true iif we have shots left
export const hasShots = (id: string, sm: ShotMap) => sm[id];

// gets the first ability/passive id with the given type and shots left
export const getIdFromType = (
  arr: Ability[] | Passive[],
  sm: ShotMap,
  type: AbilityType | PassiveType
) => {
  for (const x of arr) if (type === x.type && hasShots(x.id, sm)) return x.id;
  return null;
};
