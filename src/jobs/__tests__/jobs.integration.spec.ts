import { sumVotes } from './../../utils/user-utils';
import axios from 'axios';
import lodash from 'lodash';
import path from 'path';
import fs from 'fs';

import { IGame } from '../../dataclient/data-types';
import MockDataclient from '../../dataclient/MockDataclient';
import MockPHPBBApi from '../../phpbb-api/MockPHPBBApi';
import Manager from '../../jobs/live-game-jobs-manager';

import manageGameJob from '../manage-game-job';
import startGameJob from './../start-game-job';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('integration tests', () => {
  let oldPostsPerValue: string;
  let oldCommandValue: string;

  beforeAll(() => {
    process.env.NODE_ENV = 'prod';

    oldPostsPerValue = process.env.POSTS_PER_PAGE;
    process.env.POSTS_PER_PAGE = '25';

    oldCommandValue = process.env.START_COMMAND;
    process.env.START_COMMAND = '!joybot';
  });
  afterAll(() => {
    process.env.POSTS_PER_PAGE = oldPostsPerValue;
    process.env.START_COMMAND = oldCommandValue;
  });

  const pages = [1, 2, 3].map(p =>
    fs
      .readFileSync(
        path.resolve(__dirname, `../../../res/vfm-mock/page-${p}.html`)
      )
      .toString()
  );

  it('it should handle a basic three page game', async () => {
    const gameId = `108218`;
    let game;
    mockedAxios.get
      .mockResolvedValueOnce({ data: pages[0] })
      // Start of p1
      .mockImplementationOnce(async () => {
        game = await MockDataclient.getGame(gameId);
        writeGame(game, 1);
        return { data: pages[0] };
      })
      // Start of p2
      .mockImplementationOnce(async () => {
        game = await MockDataclient.getGame(gameId);
        writeGame(game, 2);
        const { players } = game;
        players.forEach(({ votedBy }, i) =>
          expect(votedBy.length).toBe(i === 3 ? 1 : 0)
        );
        players.forEach(({ voting }, i) =>
          expect(voting.length).toBe(i === 5 ? 1 : 0)
        );
        return { data: pages[1] };
      })
      // Start of p3
      .mockImplementationOnce(async () => {
        game = await MockDataclient.getGame(gameId);
        writeGame(game, 3);
        const { players } = game;
        players.forEach(({ votedBy }, i) =>
          expect(votedBy.length).toBe([3, 8].includes(i) ? 1 : 0)
        );
        players.forEach(({ voting }, i) =>
          expect(voting.length).toBe([5, 1].includes(i) ? 1 : 0)
        );
        return { data: pages[2] };
      });

    const mockPosterPost = jest.spyOn(MockPHPBBApi, 'post');
    const mockCreateJob = jest
      .spyOn(Manager, 'createJob')
      .mockImplementation(lodash.noop);
    const mockStopJob = jest
      .spyOn(Manager, 'stopJob')
      .mockImplementation(lodash.noop);
    const mockGetJobs = jest
      .spyOn(Manager, 'getJobs')
      .mockReturnValueOnce([])
      .mockReturnValue([gameId]);

    const updateGameSpy = jest.spyOn(MockDataclient, 'updateGame');

    await startGameJob(gameId, MockDataclient);
    game = await MockDataclient.getGame(gameId);

    expect(mockGetJobs).toHaveBeenCalledTimes(1);
    expect(mockCreateJob).toHaveBeenCalledTimes(1);
    expect(updateGameSpy).toHaveBeenCalledTimes(1);
    expect(game).toBeDefined();
    expect(game.title).toBe('Twitch Chat FM');

    await manageGameJob(gameId, MockDataclient, MockPHPBBApi);

    expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    expect(mockPosterPost).toHaveBeenCalledTimes(1);
    const { lynch, gameInfo } = mockPosterPost.mock.calls[0][1];

    expect(!!lynch).toBe(false);
    expect(gameInfo).toBe(true);

    expect(mockStopJob).toHaveBeenCalledTimes(0);

    game = await MockDataclient.getGame(gameId);
    writeGame(game, 4);
    const { players, hosts, lastPost } = game;
    expect(lastPost).toBe('3436440');
    expect(hosts.length).toBe(2);
    players.forEach(({ votedBy }, i) =>
      expect(votedBy.length).toBe(i === 8 ? 2 : 0)
    );
    players.forEach(({ voting }, i) =>
      expect(voting.length).toBe([1, 0].includes(i) ? 1 : 0)
    );
  });
});

const writeGame = (game: IGame, page: number) =>
  fs.writeFileSync(
    path.resolve(__dirname, `../../../res/vfm-mock/page-${page}.json`),
    JSON.stringify(game)
  );
