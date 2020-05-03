import {
  IGame,
  ISlot,
  createDefaultGame,
  createDefaultSlot,
} from './data-types';
export const createGame = (): IGame => ({
  ...createDefaultGame('430', {
    number: 56,
    title: 'jammies',
    type: 'AFFM',
  }),
  hosts: [{ name: 'jimmy', hex: '#900' }],
  players: [
    createDefaultSlot({ name: 'jerry' }),
    createDefaultSlot({ name: 'swords' }),
  ],
});

export const createPlayers = (): ISlot[] => {
  const players = [0, 1, 2].map(n =>
    createDefaultSlot({
      name: `${n}`,
      slotNumber: n,
      voting: [
        { slotNumber: (n + 1) % 3, weight: 1 },
        { slotNumber: (n + 2) % 3, weight: 1 },
      ],
      votedBy: [
        { slotNumber: (n + 1) % 3, weight: 1 },
        { slotNumber: (n + 2) % 3, weight: 1 },
      ],
      voteWeight: 2,
      canSplitVote: true,
    })
  );
  players.push(
    createDefaultSlot({
      name: `3`,
      slotNumber: 3,
      voting: [{ slotNumber: 4, weight: 1 }],
      voteWeight: 1,
    })
  );
  players.push(
    createDefaultSlot({
      name: `4`,
      slotNumber: 4,
      votedBy: [{ slotNumber: 3, weight: 1 }],
      voteWeight: 1,
    })
  );
  players.push(
    createDefaultSlot({
      name: `5`,
      slotNumber: 5,
      voteWeight: 100,
    })
  );
  return players;
};
