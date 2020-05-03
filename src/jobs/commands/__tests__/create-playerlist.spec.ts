import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { createPlayerlist } from '../create-playerlist';

describe('playerlist creation', () => {
  const playerlistOp = fs.readFileSync(
    path.resolve(__dirname, '../../../../res/post-op-twelve-players.html')
  );
  const playerListNone = fs.readFileSync(
    path.resolve(__dirname, '../../../../res/post-joybot-init.html')
  );

  it('should correctly parse and produce a playerlist', () => {
    const $ = cheerio.load(playerlistOp);
    const postContent = $('div.content')[0];
    const playerlist = createPlayerlist($, postContent);
    expect(playerlist.length).toBe(12);
    expect(playerlist[0].name).toBe('Varanus');
  });

  it('should create an empty list if there is no playerlist', () => {
    const $ = cheerio.load(playerListNone);
    const postContent = $('div.content')[0];
    const playerlist = createPlayerlist($, postContent);
    expect(playerlist).toEqual([]);
  });
});
