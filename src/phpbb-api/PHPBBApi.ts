import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'querystring';

import CookieManager from './CookieManager';
import { Post } from './../bbcode-builder/Post';
import logger, { Level } from './../logger/Logger';
import { IGame } from '../dataclient/data-types';
import IPHPBBApi, { IPostConfig } from './IPHBBApi';

const baseUrl = process.env.FORUM_URL;
const gamesId = process.env.GAMES_ID;

const PHPBAPI: IPHPBBApi = {
  post: async (game: IGame, options: IPostConfig) => {
    const { lynch = null, gameInfo = false, votecount = true } = options;
    const {
      id,
      config: { autolock },
      title,
    } = game;

    const post = Post(game);
    if (votecount) post.withVotecount();
    if (lynch) post.withLynched(lynch);
    post.withISOs();
    if (gameInfo) post.withInfo();
    const message = post.finish();

    await postPost({ message, subject: `${title}` }, gamesId, id);
    if (lynch && autolock) await lockTopic(gamesId, id);
  },
};

interface PostToken {
  creation_time: string;
  form_token: string;
  topic_cur_post_id: string;
}

export const getPostToken = async (
  forum: string,
  topic: string
): Promise<PostToken> =>
  (await axios
    .get(`${baseUrl}/posting.php?mode=reply&f=${forum}&t=${topic}`)
    .then(res => cheerio.load(res.data))
    .then(getHidden)) as PostToken;

interface Post {
  message: string;
  subject: string;
}

export const postPost = async (post: Post, forum: string, topic: string) => {
  const res = await getPostToken(forum, topic);
  const { creation_time, form_token } = res;
  if (!form_token) {
    logger.log(Level.INFO, 'Unable to post; thread is likely locked', res);
    return;
  }

  const form = {
    ...post,
    ...res,
    addbbcode20: 100,
    lastclick: creation_time,
    post: 'Submit',
    attach_sig: 'on',
  };

  await axios.post(
    `${baseUrl}/posting.php?mode=reply&f=${forum}&t=${topic}`,
    qs.stringify(form),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
};

interface LockToken {
  'topic_id_list[0]': string;
  confirm_uid: string;
  redirect: string;
  sess: string;
  sid: string;
  action: string;
}

export const lockTopic = async (forum: string, topic: string) => {
  const sid = CookieManager.getSession();
  const res = await getPostToken(forum, topic);
  const confirmForm = {
    ...res,
    action: 'lock',
  };

  const $ = await axios
    .post(
      `${baseUrl}/mcp.php?f=${forum}&t=${topic}&quickmod=1&sid=${sid}&redirect=.`,
      qs.stringify(confirmForm),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    .then(({ data }) => cheerio.load(data));

  const lockForm = {
    ...getHidden($),
    confirm: 'Yes',
  };

  const queryString = $('form[id="confirm"]').attr('action').substring(2);

  if (!queryString) {
    const message = 'missing query string command, unable to confirm lock';
    logger.log(Level.ERROR, message, { queryString });
    return;
  }

  await axios.post(`${baseUrl}/${queryString}`, qs.stringify(lockForm), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

const getHidden = ($: CheerioStatic): PostToken | LockToken =>
  $('input[type="hidden"]')
    .toArray()
    .reduce<PostToken | LockToken>(
      (acc, c) => ({ ...acc, [$(c).attr('name')]: $(c).attr('value') }),
      { creation_time: '', form_token: '', topic_cur_post_id: '' }
    );

export default PHPBAPI;
