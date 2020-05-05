import axios from 'axios';
import path from 'path';
import fs from 'fs';

import { getActiveGames } from '../check-games-job';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('game checking test', () => {
  let oldEnvValue: string;
  beforeAll(() => {
    oldEnvValue = process.env.POSTS_PER_PAGE;
    process.env.POSTS_PER_PAGE = '25';
  });
  afterAll(() => (process.env.POSTS_PER_PAGE = oldEnvValue));

  const noGames = fs
    .readFileSync(
      path.resolve(__dirname, '../../../res/games-only-locked.html')
    )
    .toString();
  const twoGames = fs
    .readFileSync(path.resolve(__dirname, '../../../res/games-two-active.html'))
    .toString();
  const twentyFiveGames = fs
    .readFileSync(path.resolve(__dirname, '../../../res/games-full-page.html'))
    .toString();

  describe('getGames tests', () => {
    it('should return no games if there are none', async () => {
      // @ts-ignore
      mockedAxios.get.mockReturnValueOnce(
        Promise.resolve({
          data: noGames,
        })
      );
      const games = await getActiveGames();
      expect(games.length).toEqual(0);
    });
    it('should return games from one page', async () => {
      // @ts-ignore
      mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: twoGames }));
      const games = await getActiveGames();
      expect(games.length).toEqual(2);
    });
    it('should return games from multiple pages', async () => {
      // @ts-ignore
      mockedAxios.get
        .mockResolvedValueOnce({ data: twentyFiveGames })
        .mockResolvedValueOnce({ data: twoGames });
      const games = await getActiveGames();
      expect(games.length).toEqual(27);
    });
  });
});
