"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const create_playerlist_1 = require("./../create-playerlist");
describe('playerlist creation', () => {
    const playerlistOp = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../../../res/post-op-playerlist.html'));
    it('should correctly parse and produce a playerlist', () => {
        const $ = cheerio_1.default.load(playerlistOp);
        const postContent = $('div.content')[0];
        create_playerlist_1.createPlayerlist($, postContent);
        expect(true).toBe(false);
    });
});
//# sourceMappingURL=create-playerlist.js.map