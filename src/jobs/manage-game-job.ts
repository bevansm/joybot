import { isAtMajority } from './../utils/user-utils';
import { isUndefined } from 'lodash';
import axios from 'axios';
import cheerio from 'cheerio';

import { Slot, Game, Host } from '../model/game-types';
import IDataclient from '../model/dataclient/AbstractDataclient';
import { getClient } from '../model/dataclient/Dataclient';
import IPHPBBApi from '../phpbb-api/IPHBBApi';
import PHPBAPI from '../phpbb-api/PHPBBApi';
import Manager from './live-game-jobs-manager';

import handlePlayerCommand from './commands/handle-player-command';
import handleHostCommand, { addHost } from './commands/handle-host-command';

import { hasUser, getUser } from '../utils/user-utils';
import { parseHex } from './parsers/parse-hex';
import logger, { Level } from '../logger/Logger';

const manageGameJob = async (
  gameId: string,
  dataclient: IDataclient = getClient(),
  poster: IPHPBBApi = PHPBAPI
): Promise<void> => {
  logger.log(Level.INFO, 'Scraping game info...', { gameId });

  const postsPerPage = Number(process.env.POSTS_PER_PAGE);
  const game: Game = await dataclient.getGame(gameId);
  const { lastPost, config } = game;

  const baseUrl = `${process.env.FORUM_URL}/viewtopic.php?f=${process.env.GAMES_ID}&t=${gameId}`;

  let queryString = `&p=${lastPost}`;
  let lynchedPlayer: Slot;
  let shouldPrint;
  let pCurrentPost: string = `p${lastPost}`;
  let pCurrLastPost;

  while (pCurrLastPost !== pCurrentPost) {
    let $;
    try {
      $ = await axios
        .get(`${baseUrl}${queryString}`)
        .then(res => cheerio.load(res.data));
    } catch (e) {
      logger.log(Level.ERROR, 'Unable to retrieve page...', { queryString });
      break;
    }

    pCurrLastPost = `p${$('input[name="topic_cur_post_id"]').val()}`;

    // Kill all quoted posts
    $('blockquote').remove();

    const page = Number($('div.pagination span strong').text());
    const posts = $('div.post').toArray();

    for (const post of posts) {
      const id = $(post).attr('id');
      if (id <= lastPost) continue;
      pCurrentPost = id;

      const allowPlayerPosts = !lynchedPlayer && config.enabled;
      const { lynched, print } = handlePost(game, post, $, allowPlayerPosts);
      if (!lynchedPlayer) lynchedPlayer = lynched;
      if (!isUndefined(print)) shouldPrint = print;
    }
    queryString = `&start=${(page + 1) * postsPerPage}`;
  }

  const { hosts } = game;
  if (hosts.length > 0)
    await poster.post(game, {
      votecount: true,
      gameInfo: shouldPrint,
      lynch: lynchedPlayer,
    });
  if (lynchedPlayer) Manager.stopJob(gameId);

  await dataclient.setGame({ ...game, lastPost: pCurrentPost.substring(1) });
};

interface PostHandlerReply {
  lynched?: Slot;
  print?: boolean;
}

const handlePost = (
  game: Game,
  post: CheerioElement,
  $: CheerioStatic,
  allowPlayers: boolean = false
): PostHandlerReply => {
  const { hosts } = game;
  const username = $(post)
    .find('dl.postprofile a[href*="viewprofile"]')
    .attr('href')
    .split('=')
    .pop();

  const content = $(post).find('div.content')[0];
  if (hasUser(username, hosts) || hosts.length === 0)
    return handleHostPost(username, game, content, $);
  else if (allowPlayers) return handleUserPost(username, game, content, $);
  else return {};
};

const handleHostPost = (
  name: string,
  game: Game,
  content: CheerioElement,
  $: CheerioStatic
): PostHandlerReply => {
  const startCommand = process.env.START_COMMAND.toUpperCase();
  const { hosts } = game;

  const text = $(content)
    .text()
    .split('\n')
    .map(l => l.trim());

  let print;

  for (let line of text) {
    const upperLine = line.toUpperCase();
    if (upperLine.indexOf(startCommand) > -1) {
      line = line.substring(upperLine.indexOf(startCommand));
      if (hosts.length === 0) addHost(name, '#000', hosts);
      const res = handleHostCommand(game, line, $, content);
      if (!isUndefined(res)) print = res;
    }
  }

  const host = getUser(name, hosts) as Host;
  if (host) {
    const { hex } = host;
    if (hex === '#000') host.hex = parseHex(content, $) || '#000';
  } else {
    logger.log(Level.DEBUG, "expected a host but didn't find one", {
      name,
      gameId: game.id,
      lines: text.length,
    });
  }

  const {
    players,
    config: { majority },
  } = game;

  let lynched;
  for (const player of players) {
    if (isAtMajority(player, majority)) {
      lynched = player;
      break;
    }
  }

  return { print, lynched };
};

const handleUserPost = (
  name: string,
  game: Game,
  content: CheerioElement,
  $: CheerioStatic
): PostHandlerReply => {
  // if we have a user, ignore spoilers
  $(content).find('.quotecontent').remove();

  const { players } = game;
  const player = getUser(name, players) as Slot;
  if (player && player.isAlive) {
    const bolded = $(content)
      .find('span[style*="font-weight: bold"]')
      .toArray();
    const votes: string[] = bolded.reduce((arr, e) => {
      const text = $(e).text();
      const index = text.indexOf('/');
      if (index > -1) arr.push(text.substring(index));
      return arr;
    }, []);

    for (const vote of votes) {
      const res = handlePlayerCommand(vote, name, game);
      if (res) {
        return { lynched: res };
      }
    }
  }
  return {};
};

export default manageGameJob;
