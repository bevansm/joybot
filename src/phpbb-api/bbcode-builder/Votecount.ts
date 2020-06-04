import { Center } from './TagDecorators';
import { sumVotes } from '../../utils/user-utils';
import { ISlot } from '../../model/data-types';

export const Votecount = (slots: ISlot[], majority: number): string => {
  const sorted = [...slots].sort(
    (a, b) => sumVotes(b.votedBy) - sumVotes(a.votedBy)
  );

  return `[votes=${majority}]${sorted
    .filter(({ votedBy }) => votedBy.length)
    .map(
      ({ name, votedBy }) =>
        `${name}|${sumVotes(votedBy)}|${votedBy
          .map(({ slotNumber }) => slots[slotNumber].name)
          .join(', ')}`
    )
    .join('; ')}[/votes]

    ${Center(
      `Not Voting: ${slots
        .filter(({ voting, isAlive }) => !voting.length && isAlive)
        .map(({ name }) => name)
        .join(', ')}`
    )}`;
};
