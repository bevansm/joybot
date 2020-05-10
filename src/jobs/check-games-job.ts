import cheerio from 'cheerio';
import axios from 'axios';

import logger, { Level } from './../logger/Logger';
import Manager from './live-game-jobs-manager';
import { startGameJob } from './start-game-job';

/**
 * @returns a list of topic numbers of all active games
 */
export const getActiveGames = async (): Promise<string[]> => {
  const baseUrl = `${process.env.FORUM_URL}/viewforum.php?f=${process.env.GAMES_ID}`;
  logger.log(Level.INFO, 'Grabbing active games');

  const postsPerPage = Number(process.env.POSTS_PER_PAGE);
  let start = 0;
  let hasNextPage = false;
  let $: CheerioStatic;
  let pages: string[] = [];

  do {
    try {
      $ = cheerio.load((await axios.get(`${baseUrl}&start=${start}`)).data);
    } catch (e) {
      logger.log(Level.ERROR, 'Unable to grab game threads', { e });
      process.exit(1);
    }

    const topics = ($(
      'dl[style*="sticky_unread.gif"], dl[style*="sticky_read.gif"]'
    )
      .find('a.topictitle')
      .map((_, e) => {
        const link = $(e).attr('href');
        const topicNumber = link.substring(link.lastIndexOf('=') + 1);
        return topicNumber;
      })
      .toArray() as unknown) as string[];

    pages = pages.concat(topics);
    hasNextPage = topics.length === postsPerPage;
    start += postsPerPage;
  } while (hasNextPage);

  return pages;
};

export const manageActiveGames = async (games: string[]) => {
  logger.log(Level.INFO, 'Starting jobs for games', { games });
  const oldGames = Manager.getJobs();
  oldGames.forEach(g => {
    if (!games.includes(g)) Manager.stopJob(g);
  });
  games.forEach(g => {
    if (!oldGames.includes(g)) startGameJob(g);
  });
};

export default async () => manageActiveGames(await getActiveGames());
