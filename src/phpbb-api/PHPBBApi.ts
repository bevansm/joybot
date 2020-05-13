import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'querystring';
import fs from 'fs';
import path from 'path';

import CookieManager from './CookieManager';
import { Post } from './../bbcode-builder/Post';
import logger, { Level } from './../logger/Logger';
import { IGame } from '../model/data-types';
import IPHPBBApi, { IPostConfig } from './IPHBBApi';

const PHPBAPI: IPHPBBApi = {
  post: async (game: IGame, options: IPostConfig) => {
    const gamesId = process.env.GAMES_ID;
    const { lynch = null, gameInfo = false, votecount = true } = options;
    const {
      id,
      config: { autolock },
      title,
      players,
    } = game;

    const post = Post(game);
    if (votecount && players.length > 0) post.withVotecount();
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
    .get(
      `${process.env.FORUM_URL}/posting.php?mode=reply&f=${forum}&t=${topic}`
    )
    .then(res => cheerio.load(res.data))
    .then(getHidden)
    .catch(e => {
      logger.log(Level.ERROR, 'unable to retrieve post token', {
        forum,
        topic,
        e,
      });
      return undefined;
    })) as PostToken;

interface Post {
  message: string;
  subject: string;
}

export const postPost = async (post: Post, forum: string, topic: string) => {
  const res = await getPostToken(forum, topic);
  const { creation_time, form_token } = res || {};
  if (!res || !form_token) {
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
    notify: 'on',
  };
  try {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const data = await axios
      .post(
        `${process.env.FORUM_URL}/posting.php?mode=reply&f=${forum}&t=${topic}`,
        qs.stringify(form),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
      .then(res => res.data);
    const $ = cheerio.load(data);
    if (
      $('div').text().indexOf('This message has been posted successfully') ===
      -1
    ) {
      fs.writeFileSync(path.resolve(__dirname, `recieved-page.html`), data);
      throw new Error(
        'Unable to successfully post message; did not recieve redirect.'
      );
    }
  } catch (e) {
    logger.log(Level.ERROR, 'Unable to create post', { form, topic, e });
  }
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
  if (!res) return;
  const confirmForm = {
    ...res,
    action: 'lock',
  };

  let $;
  try {
    $ = await axios
      .post(
        `${process.env.FORUM_URL}/mcp.php?f=${forum}&t=${topic}&quickmod=1&sid=${sid}&redirect=.`,
        qs.stringify(confirmForm),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      .then(({ data }) => cheerio.load(data));
  } catch (e) {
    logger.log(Level.ERROR, 'unable to retrieve post lock form', {
      forum,
      topic,
      e,
    });
    return;
  }

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

  try {
    await axios.post(
      `${process.env.FORUM_URL}/${queryString}`,
      qs.stringify(lockForm),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
  } catch (e) {
    logger.log(Level.ERROR, 'unable to lock topic', { forum, topic, e });
    return;
  }
};

const getHidden = ($: CheerioStatic): PostToken | LockToken =>
  $('input[type="hidden"]')
    .toArray()
    .reduce<PostToken | LockToken>(
      (acc, c) => ({ ...acc, [$(c).attr('name')]: $(c).attr('value') }),
      { creation_time: '', form_token: '', topic_cur_post_id: '' }
    );

export default PHPBAPI;
