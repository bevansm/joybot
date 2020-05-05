import { applyCommand, HostCommands } from '../handle-host-command';
import { createSlot } from '../../../models/data-types';
import { createMockGame } from '../../../models/dataclient/create-mocks';

describe('command parsing tests', () => {
  let oldCommand: string;
  beforeAll(() => {
    oldCommand = process.env.START_COMMAND;
    process.env.START_COMMAND = '!';
  });
  afterAll(() => (process.env.START_COMMAND = oldCommand));

  describe('manage hosts', () => {
    describe('add hosts', () => {
      const name = `marcy`;

      it('should add a host with a hex color', () => {
        const hex = '#900';
        const command = `${HostCommands.HOST_ADD} ${name} ${hex}`;
        const game = createMockGame();
        applyCommand(game, command);
        expect(game.hosts[1]).toEqual({ name, hex });
      });
      it('add a host without a hex color', () => {
        const hex = '#000';
        const command = `${HostCommands.HOST_ADD} ${name}`;
        const game = createMockGame();
        applyCommand(game, command);
        expect(game.hosts[1]).toEqual({ name, hex });
      });

      it('not add an empty host', () => {
        const game = createMockGame();
        applyCommand(game, HostCommands.HOST_ADD);
        expect(game.hosts.length).toEqual(createMockGame().hosts.length);
      });
    });

    describe('remove hosts', () => {
      it('should remove a host from the game', () => {
        const { hosts: expectedHosts } = createMockGame();
        expectedHosts.pop();

        const game = createMockGame();
        const { hosts } = game;
        const { name } = hosts[0];
        const command = `${HostCommands.HOST_REMOVE} ${name}`;

        applyCommand(game, command);
        expect(hosts).toEqual(expectedHosts);
      });

      it('should not remove a non-existant host', () => {
        const game = createMockGame();
        applyCommand(game, HostCommands.HOST_REMOVE);
        expect(game.hosts).toEqual(createMockGame().hosts);
      });
    });
  });

  describe('manage players', () => {
    describe('add players', () => {
      it('should be able to add multiple players', () => {
        const n1 = 'marcy';
        const n2 = 'dave';
        const game = createMockGame();
        const command = `${HostCommands.PLAYER_ADD} ${n1} ${n2}`;
        applyCommand(game, command);
        expect(game.players.map(p => p.name)).toEqual([
          ...createMockGame().players.map(p => p.name),
          n1,
          n2,
        ]);
      });

      it('should not add the same player twice', () => {
        const game = createMockGame();
        const name = 'marcy';
        const command = `${HostCommands.PLAYER_ADD} ${name} ${name}`;
        applyCommand(game, command);
        expect(game.players.map(p => p.name)).toEqual([
          ...createMockGame().players.map(p => p.name),
          name,
        ]);
      });

      it('should not add a player already included', () => {
        const game = createMockGame();
        const command = `${HostCommands.PLAYER_ADD} ${game.players[0].name}`;
        applyCommand(game, command);
        expect(game.players).toEqual(createMockGame().players);
      });
    });

    describe('replace players', () => {
      it('should be able to replace a player', () => {
        const game = createMockGame();
        game.players = [
          createSlot({ name: 'marcy' }),
          createSlot({ name: 'manny' }),
        ];
        const expectedGame = createMockGame();
        expectedGame.players = [
          createSlot({ name: 'jenny', history: ['marcy'] }),
          createSlot({ name: 'manny' }),
        ];

        const command = `${HostCommands.PLAYER_REPLACE} marcy jenny`;
        applyCommand(game, command);
        expect(game).toEqual(expectedGame);
      });

      it('should not be able to replace in a player already in the game', () => {
        const game = createMockGame();
        const command = `${HostCommands.PLAYER_REPLACE} ${game.players[0].name} ${game.players[1].name}`;
        applyCommand(game, command);
        expect(game).toEqual(createMockGame());
      });

      it('should not replace if there is an argument that is not defined', () => {
        const game = createMockGame();
        const command = `${HostCommands.PLAYER_REPLACE} ${game.players[0].name}`;
        applyCommand(game, command);
        expect(game).toEqual(createMockGame());
      });
      it('should not replace if the target is not in the game', () => {
        const game = createMockGame();
        const command = `${HostCommands.PLAYER_REPLACE} johnnyjingle jamiejunes`;
        applyCommand(game, command);
        expect(game).toEqual(createMockGame());
      });
    });

    describe('update player attributes', () => {
      it('should be able to update a number attribute', () => {
        const game = createMockGame();
        const { name, voteWeight } = game.players[0];
        const newWeight = voteWeight + 5;
        const command = `${HostCommands.CHANGE_WEIGHT} ${name} ${newWeight}`;
        applyCommand(game, command);
        expect(game.players[0].voteWeight).toEqual(newWeight);
      });

      it('should not update a number attribute if given a word', () => {
        const game = createMockGame();
        const { name, voteWeight } = game.players[0];
        const command = `${HostCommands.CHANGE_WEIGHT} ${name} mary had a little lamb`;
        applyCommand(game, command);
        expect(game.players[0].voteWeight).toEqual(voteWeight);
      });
    });
  });
});
