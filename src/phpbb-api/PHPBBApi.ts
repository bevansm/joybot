import axios, { AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import CookieManager from './CookieManager';
import FormData from 'form-data';
import cheerio from 'cheerio';

import logger, { Level } from './../logger/Logger';
import { IGame } from '../dataclient/data-types';
import IPHPBBApi, { IPostConfig } from './IPHBBApi';
import { mapToFormData } from '../utils/api-utils';
import { CookieJar } from 'tough-cookie';

axiosCookieJarSupport(axios);

const baseUrl = process.env.FORUM_URL;
const gamesId = process.env.GAMES_ID;

const PHPBAPI: IPHPBBApi = {
  post: async (game: IGame, options: IPostConfig) => {
    await CookieManager.update();

    const {
      formToken = '',
      lastPostId = '',
      lynch = null,
      gameInfo = false,
      votecount = true,
    } = options;
    const {
      id,
      config: { autolock },
    } = game;
    const jar = getJar();
    const sid = jar
      .getCookiesSync(baseUrl)
      .filter(c => c.key === 'phpbb3_fwbpj_sid')[0].value;

    if (!formToken || !lastPostId) {
      logger.log(
        Level.INFO,
        `Tried to post message for ${id}, but thread was locked/value not defined`,
        options
      );
      return;
    }

    if (lynch && autolock) {
      await lockTopic(gamesId, id, formToken, sid);
    }
  },
};

const lockTopic = async (
  forum: string,
  topic: string,
  token: string,
  sid: string
) => {
  const confirmForm = mapToFormData({
    action: 'lock',
    form_token: token,
    creation_time: getUnixTime(),
  });
  const $ = await axios
    .post(
      `${baseUrl}/mcp.php?f=${forum}&t=${topic}&quickmod=1&sid=${sid}`,
      confirmForm,
      getAxiosConfig()
    )
    .then(res => cheerio.load(res.data));

  const confirmUid = $('input[name="confirm_uid"]').attr('value');
  const lockForm = mapToFormData({
    'topic_id_list[0]': topic,
    action: 'lock',
    redirect: './ucp.php',
    confirm_uid: confirmUid,
    sess: sid,
    sid,
    confirm: 'Yes',
  });

  const queryString = $('form[id="input"]').attr('action').substring(2);
  axios.post(
    `${baseUrl}/${queryString}`,
    lockForm,
    getAxiosConfig(getJar(), lockForm)
  );
};

const getUnixTime = () => Math.floor(new Date().getTime() / 1000);

let jar: CookieJar;
const getJar = (): CookieJar => {
  if (!jar) {
    if (process.env._S && process.env.NODE_ENV === 'dev') {
      jar = new CookieJar();
      jar.setCookieSync(`phpbb3_fwbpj_sid=${process.env._S}`, baseUrl);
    } else {
      jar = CookieManager.jar;
    }
  }
  return jar;
};

const getAxiosConfig = (
  jar?: CookieJar,
  form?: FormData
): AxiosRequestConfig => ({
  jar: jar || getJar(),
  withCredentials: true,
  headers: form ? { ...form.getHeaders() } : undefined,
});

export default PHPBAPI;
