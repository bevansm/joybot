import { IGame, createGame, GameType } from '../../dataclient/data-types';
import PHPBAPI from '../PHPBBApi';
describe('phpbb api tests', () => {
  const sidDescribe = process.env._S ? describe : describe.skip;
  sidDescribe('integration with sid on localhost', () => {
    const game: IGame = createGame('1234', {
      type: GameType.VFM,
      gameNumber: 89,
      title: 'Right into your dms',
    });

    it('should be able to make a request to post', async () => {
      await PHPBAPI.post(game, {});
    });
  });
});
