import { config } from '../PHPBBApi';
import axios from 'axios';

describe('phpbb api sanity tests', () => {
  describe('config tests', () => {
    it('should be able to get a page with the login config', async () => {
      const headers = await axios
        .get(process.env.FORUM_URL, config)
        .then(res => res.headers);
      expect(headers['set-cookie'].length).toBeGreaterThan(1);
    });
    it('should be able to hit the login page', async () => {
      const headers = await axios
        .get(`${process.env.FORUM_URL}/ucp.php?mode=login`, config)
        .then(res => res.headers);
      console.log(headers);
      expect(headers['set-cookie'].length).toBeGreaterThan(1);
    });
  });
});
