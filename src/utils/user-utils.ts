import { Slot, Vote, Named } from '../model/game-types';
import { isEqual } from './format-utils';
import { isInteger } from 'lodash';
import { findBestMatch } from 'string-similarity';

export const hasUser = (user: string, users: Named[]): boolean =>
  !users.every(u => !isEqual(user, u.name));

export const getUser = (user: string, users: Named[]): Named =>
  users.find(u => isEqual(user, u.name));

export const inferUser = (seedName: string, users: Named[]): Named => {
  const mostSimilar = findBestMatch(
    seedName,
    users.map(u => u.name)
  ).bestMatch.target;
  for (const u of users) {
    if (u.name === mostSimilar) return u;
  }
};

export const sumVotes = (votes: Vote[]): number =>
  votes.reduce((acc, v) => acc + v.weight, 0);

export const isAtMajority = (player: Slot, majority: number): boolean => {
  const { votedBy, extraVotesToLynch } = player;
  return sumVotes(votedBy) - extraVotesToLynch >= majority;
};

export const findMaj = (players: Slot[]): number => {
  const half = players.filter(p => p.isAlive).length / 2;
  return isInteger(half) ? half + 1 : Math.ceil(half);
};
