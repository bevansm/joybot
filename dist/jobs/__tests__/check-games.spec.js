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
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const check_games_job_1 = require("../check-games-job");
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('game management tests', () => {
    let oldEnvValue;
    beforeAll(() => {
        oldEnvValue = process.env.POSTS_PER_PAGE;
        process.env.POSTS_PER_PAGE = '25';
    });
    afterAll(() => (process.env.POSTS_PER_PAGE = oldEnvValue));
    const noGames = fs_1.default
        .readFileSync(path_1.default.resolve(__dirname, '../../../res/games-only-locked.html'))
        .toString();
    const twoGames = fs_1.default
        .readFileSync(path_1.default.resolve(__dirname, '../../../res/games-two-active.html'))
        .toString();
    const twentyFiveGames = fs_1.default
        .readFileSync(path_1.default.resolve(__dirname, '../../../res/games-full-page.html'))
        .toString();
    describe('getGames tests', () => {
        it('should return no games if there are none', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: noGames }));
            const games = yield check_games_job_1.getActiveGames();
            expect(games.length).toEqual(0);
        }));
        it('should return games from one page', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: twoGames }));
            const games = yield check_games_job_1.getActiveGames();
            expect(games.length).toEqual(2);
        }));
        it('should return games from multiple pages', () => __awaiter(void 0, void 0, void 0, function* () {
            mockedAxios.get
                .mockResolvedValueOnce({ data: twentyFiveGames })
                .mockResolvedValueOnce({ data: twoGames });
            const games = yield check_games_job_1.getActiveGames();
            expect(games.length).toEqual(27);
        }));
    });
});
//# sourceMappingURL=check-games.spec.js.map