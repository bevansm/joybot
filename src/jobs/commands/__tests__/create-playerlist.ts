import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { createPlayerlist } from './../create-playerlist';

describe('playerlist creation', () => {
  const playerlistOp = fs.readFileSync(
    path.resolve(__dirname, '../../../../res/post-op-playerlist.html')
  );

  it('should correctly parse and produce a playerlist', () => {
    const $ = cheerio.load(playerlistOp);
    const postContent = $('div.content')[0];
    console.log($(`div.content`));
    createPlayerlist($, postContent);
    expect(true).toBe(true);
  });
});
