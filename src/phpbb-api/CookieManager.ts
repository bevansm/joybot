import { isEqual } from './../utils/format-utils';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import readline from 'readline';
import tough from 'tough-cookie';

import logger, { Level } from '../logger/Logger';
import { mapToFormData } from '../utils/api-utils';

axiosCookieJarSupport(axios);

interface CookieManager {
  jar: tough.CookieJar;
  login: () => Promise<void>;
  getSession: () => string;
}

const jar = new tough.CookieJar();
jar.setCookieSync('style_cookie=printonly', process.env.FORUM_URL);

export const login = async () => {
  while (!process.env.CAPTCHA) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    await new Promise(resolve =>
      rl.question('please provide a captcha token:\n', input => {
        process.env.CAPTCHA = input;
        rl.close();
        resolve();
      })
    );
  }

  const form = mapToFormData({
    username: process.env.USER || '',
    password: process.env.PASSWORD || '',
    autologin: 'on',
    login: 'Login',
    redirect: './ucp.php',
    'g-recaptcha-response': process.env.CAPTCHA || '',
  });
  try {
    const { status, data } = await axios.post(
      `${process.env.FORUM_URL}/ucp.php?mode=login`,
      form,
      {
        headers: { ...form.getHeaders() },
      }
    );
    if (status !== 200)
      throw new Error(`status of ${200} when trying to log in`);
    if (data.indexOf('class="error"') > -1) {
      const error = data.split('class="error">')[1].split('<')[0];
      throw new Error(`response page contains an error: ${error}`);
    }
  } catch (e) {
    logger.log(Level.ERROR, 'Unable to log in; trying again', e);
    process.env.CAPTCHA = '';
    await login();
  }
};

// Extend the time that we'll wait for a response
axios.defaults.timeout = 60000;

// Always make sure that we're posting from a web browser
axios.interceptors.request.use(async req => {
  const { url, method, headers } = req;
  if (headers.Cookie) {
    logger.log(Level.ERROR, 'Found unexpected cookies on header.', {
      url,
      method,
      headers,
    });
  } else if (url.indexOf(process.env.FORUM_URL) > -1) {
    logger.log(Level.INFO, 'Outgoing request', { url, method });
    req.jar = jar;
    req.withCredentials = true;
    headers['User-Agent'] = "Mozilla/5.0 (moon's messing around)";

    if (isEqual(method, 'post')) {
      headers['Accept-Encoding'] = 'gzip, deflate, br';
      headers.Accept =
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
    }
  }
  return req;
});

// Always making sure cookies on responses from POST requests are valid
axios.interceptors.response.use(async res => {
  const {
    data,
    headers,
    config: { headers: reqHeaders, data: reqData, url, method },
  } = res;
  logger.log(Level.INFO, 'Incoming response', { url, method });

  // If we made the request to the forum, make sure our cookies are up to date
  if (typeof data === 'string' && url.indexOf(process.env.FORUM_URL) > -1) {
    if (data.indexOf('class="g-recaptcha"') > 0) {
      logger.log(
        Level.ERROR,
        'Unable to refresh token; encountered captcha. Terminating process.',
        { reqData, resHeaders: headers, reqHeaders, url }
      );
      if (url.indexOf('login') > -1) return Promise.reject();
      process.exit(1);
    } else if (data.indexOf(`Logout [ ${process.env.USER} ]`) === -1) {
      logger.log(
        Level.ERROR,
        'Unable to refresh token; page returned no longer has user logged in. Terminating process.',
        { reqData, resHeaders: headers, reqHeaders, url }
      );
      process.exit(1);
    }

    // If we've been given cookies, set 'em
    if (headers['set-cookie']) {
      setCookies(headers);
      const userCookieId = jar
        .getCookiesSync(process.env.FORUM_URL)
        .find(c => c.key === 'phpbb3_fwbpj_u').value;

      // If the cookie has a value of the following, we have a not logged in user.
      if ([undefined, '', '1', '0'].indexOf(userCookieId) > -1) {
        logger.log(
          Level.ERROR,
          'Did not recieve cookies indicating that the user is logged in. Terminating process.',
          { data, resHeaders: headers, reqHeaders, url }
        );
        process.exit(1);
      }
    }
  }
  return res;
});

const setCookies = (headers: any) =>
  headers['set-cookie'].forEach((c: string) =>
    jar.setCookieSync(c, process.env.FORUM_URL)
  );

const getSession = () =>
  jar.getCookiesSync(process.env.FORUM_URL).find(c => c.key.indexOf('sid') > -1)
    .value;

const Manager: CookieManager = { jar, login, getSession };

export default Manager;
