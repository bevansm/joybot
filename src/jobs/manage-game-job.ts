import axios from 'axios';

import Dataclient from '../models/Dataclient';
import IDataclient from '../models/IDataclient';
import { IGame } from '../models/data-types';

const manageGameHandler = async (
  gameId: string,
  dataclient: IDataclient = Dataclient
): Promise<void> => {
  const postsPerPage = Number(process.env.POSTS_PER_PAGE);

  const game: IGame = await dataclient.getGame(gameId);
  const {
    loc: { page, post },
  } = game;

  const baseUrl = `${process.env.FORUM_URL}/viewtopic.php?f=${process.env.GAMES_ID}&t=${gameId}`;

  let currentPage = page;
  let postsOnPage;
  let lastPost;

  do {
    await axios.get(`${baseUrl}&start=${currentPage * postsPerPage}`);
    currentPage++;
  } while (postsOnPage === postsPerPage);
};

export default manageGameHandler;
