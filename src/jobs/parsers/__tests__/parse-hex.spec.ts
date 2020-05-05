import cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import { parseHex } from '../parse-hex';

describe('parse hex', () => {
  const hostBody = fs
    .readFileSync(
      path.resolve(__dirname, '../../../../res/content-host-color.html')
    )
    .toString();
  it('should correctly parse the majority non-reserved hex', () => {
    const $ = cheerio.load(hostBody);
    const content = $('div.content')[0];
    expect(parseHex(content, $)).toBe('#FF40FF');
  });
});
