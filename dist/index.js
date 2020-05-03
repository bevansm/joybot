"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./api/users"));
const games_1 = __importDefault(require("./api/games"));
dotenv_1.default.config();
const app = express_1.default();
app.get('/v0/users', users_1.default);
app.get('/v1/games', games_1.default);
app.listen(8888);
//# sourceMappingURL=index.js.map