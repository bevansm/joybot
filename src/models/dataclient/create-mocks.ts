import { IGame, ISlot, createGame, createSlot, GameType } from '../data-types';
export const createMockGame = (): IGame => ({
  ...createGame('430', {
    gameNumber: 56,
    title: 'jammies',
    type: GameType.APRILFOOLS,
  }),
  hosts: [{ name: 'jimmy', hex: '#900' }],
  players: [createSlot({ name: 'jerry' }), createSlot({ name: 'swords' })],
});

export const createMockPlayers = (): ISlot[] => {
  const players = [0, 1, 2].map(n =>
    createSlot({
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
    createSlot({
      name: `3`,
      slotNumber: 3,
      voting: [{ slotNumber: 4, weight: 1 }],
      voteWeight: 1,
    })
  );
  players.push(
    createSlot({
      name: `4`,
      slotNumber: 4,
      votedBy: [{ slotNumber: 3, weight: 1 }],
      voteWeight: 1,
    })
  );
  players.push(
    createSlot({
      name: `5`,
      slotNumber: 5,
      voteWeight: 100,
    })
  );
  return players;
};
