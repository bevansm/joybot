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
  update: () => Promise<void>;
}

const jar = new tough.CookieJar();
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
    const { status, data, headers } = await axios.post(
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
    setCookies(headers);
  } catch (e) {
    logger.log(Level.ERROR, 'Unable to log in; trying again', e);
    process.env.CAPTCHA = '';
    await login();
  }
};

const update = async () => {
  const baseUrl = process.env.FORUM_URL;
  const { headers, data } = await axios.get(`${baseUrl}/ucp.php`, {
    jar,
    withCredentials: true,
  });
  if (data.indexOf('captcha') > 0) {
    logger.log(
      Level.ERROR,
      'Unable to refresh token; encountered captcha. killing process.',
      { data }
    );
    process.exit(1);
  } else {
    setCookies(headers);
  }
};

const setCookies = (headers: any) =>
  headers['set-cookie'].forEach((c: string) =>
    jar.setCookieSync(c, process.env.FORUM_URL)
  );

const Manager: CookieManager = { jar, login, update };

export default Manager;
