"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const live_game_jobs_manager_1 = __importDefault(require("./live-game-jobs-manager"));
const start_game_job_1 = require("./start-game-job");
const baseUrl = `${process.env.FORUM_URL}/viewforum.php?f=${process.env.GAMES_ID}`;
/**
 * @returns a list of topic numbers of all active games
 */
exports.getActiveGames = () => __awaiter(void 0, void 0, void 0, function* () {
    const postsPerPage = Number(process.env.POSTS_PER_PAGE);
    let start = 0;
    let hasNextPage = false;
    let $;
    let pages = [];
    do {
        $ = yield axios_1.default
            .get(`${baseUrl}&start=${start}`)
            .then(res => cheerio_1.default.load(res.data));
        const topics = $('dl[style*="sticky_unread.gif"], dl[style*="sticky_read.gif"]')
            .find('a.topictitle')
            .map((_, e) => {
            const link = $(e).attr('href');
            const topicNumber = link.substring(link.lastIndexOf('=') + 1);
            return topicNumber;
        })
            .toArray();
        pages = pages.concat(topics);
        hasNextPage = topics.length === postsPerPage;
        start += postsPerPage;
    } while (hasNextPage);
    return pages;
});
exports.manageActiveGames = (games) => __awaiter(void 0, void 0, void 0, function* () {
    const oldGames = live_game_jobs_manager_1.default.getJobs();
    oldGames.forEach(g => {
        if (!games.includes(g))
            live_game_jobs_manager_1.default.stopJob(g);
    });
    games.forEach(g => {
        if (!oldGames.includes(g))
            start_game_job_1.startGameJob(g);
    });
});
exports.default = () => __awaiter(void 0, void 0, void 0, function* () { return exports.manageActiveGames(yield exports.getActiveGames()); });
//# sourceMappingURL=check-games-job.js.map