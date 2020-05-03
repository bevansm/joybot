import DefaultConfig, {
  IGame,
  createDefaultSlot,
  ISlot,
} from './data-types';
export const createGame = (): IGame => {
  return {
    config: { ...DefaultConfig },
    id: '430',
    lastVotecount: '430',
    type: 'SFM',
    number: 50,
    hosts: [{ name: 'jimmy', hex: '#900' }],
    title: 'Test',
    players: [
      createDefaultSlot({ name: 'jerry' }),
      createDefaultSlot({ name: 'swords' }),
    ],
  };
};

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
