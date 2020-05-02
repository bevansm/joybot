import cheerio from 'cheerio';
import axios from 'axios';

import Manager from './live-game-jobs-manager';
import { startGameJob } from './start-game-job';

const baseUrl = `${process.env.FORUM_URL}/viewforum.php?f=${process.env.GAMES_ID}`;

/**
 * @returns a list of topic numbers of all active games
 */
export const getActiveGames = async (): Promise<string[]> => {
  const postsPerPage = Number(process.env.POSTS_PER_PAGE);
  let start = 0;
  let hasNextPage = false;
  let $: CheerioStatic;
  let pages: string[] = [];

  do {
    $ = await axios
      .get(`${baseUrl}&start=${start}`)
      .then(res => cheerio.load(res.data));
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
  const oldGames = Manager.getJobs();
  oldGames.forEach(g => {
    if (!games.includes(g)) Manager.stopJob(g);
  });
  games.forEach(g => {
    if (!oldGames.includes(g)) startGameJob(g);
  });
};

export default async () => manageActiveGames(await getActiveGames());
