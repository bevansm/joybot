"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_playerlist_1 = require("./create-playerlist");
const lodash_1 = require("lodash");
const helpers_1 = require("../helpers");
const data_types_1 = require("../../models/data-types");
var Commands;
(function (Commands) {
    Commands["RESET"] = "reset";
    Commands["HOST_ADD"] = "add-host";
    Commands["HOST_REMOVE"] = "remove-hosts";
    Commands["PLAYERLIST"] = "create-playerlist";
    Commands["PLAYER_ADD"] = "add-players";
    Commands["PLAYER_KILL"] = "kill-players";
    Commands["PLAYER_REPLACE"] = "replace-player";
    Commands["CHANGE_WEIGHT"] = "change-weight";
    Commands["CHANGE_VOTES_NEEDED"] = "change-votes-needed";
    Commands["MAJORITY"] = "majority";
    Commands["EVERY"] = "every";
    Commands["AUTOLOCK"] = "autolock";
})(Commands = exports.Commands || (exports.Commands = {}));
/**
 * Applies the given commands to the game. Note that this mutates the game object.
 * @param game
 * @param commandString
 * @param $
 * @param postContent
 */
exports.applyCommands = (game, commandString, $, postContent) => {
    const startCommand = process.env.START_COMMAND;
    commandString
        .substring(commandString.indexOf(startCommand) + 1)
        .split('--')
        .map(c => exports.applyCommand(game, c.trim(), $, postContent));
};
/**
 * Applies the given command.
 * Note: This mutates the given IGame.
 * @param game
 * @param command
 * @param $
 * @param postContent
 */
exports.applyCommand = (game, command, $, postContent) => {
    const args = command.split(' ').map(c => c.trim());
    const numArg1 = isNaN(Number(args[1])) ? undefined : Number(args[1]);
    const numArg2 = isNaN(Number(args[2])) ? undefined : Number(args[2]);
    const { hosts, players, config } = game;
    switch (args[0]) {
        case Commands.RESET:
            game.voteCount = {};
            break;
        case Commands.HOST_ADD:
            addHost(args[1], args[2], hosts);
            break;
        case Commands.HOST_REMOVE:
            removeHost(args[1], hosts);
            break;
        case Commands.PLAYERLIST:
            game.players = create_playerlist_1.createPlayerlist($, postContent);
            break;
        case Commands.PLAYER_ADD:
            args.slice(1).map(p => addPlayer(p, players));
            break;
        case Commands.PLAYER_KILL:
            args.slice(1).map(p => updatePlayer(p, players, { isAlive: false }));
            break;
        case Commands.PLAYER_REPLACE:
            replacePlayer(args[1], args[2], game);
            break;
        case Commands.CHANGE_WEIGHT:
            updatePlayer(args[1], players, { voteWeight: numArg2 });
            break;
        case Commands.CHANGE_VOTES_NEEDED:
            updatePlayer(args[1], players, { votesNeeded: numArg2 });
            break;
        case Commands.MAJORITY:
            updateConfig(config, { majority: numArg1 });
            break;
        case Commands.EVERY:
            updateConfig(config, { interval: numArg1 });
            break;
        case Commands.AUTOLOCK:
            updateConfig(config, { autolock: Boolean(args[1]) });
            break;
        default:
        // Do nothing
    }
};
const hasUser = (user, users) => !users.every(u => !helpers_1.areEqual(user, u.name));
const addHost = (name, hex = '', hosts) => {
    if (!name || hasUser(name, hosts))
        return;
    if (helpers_1.isValidHex(hex))
        hosts.push({ name, hex });
    else
        hosts.push({ name, hex: '#000' });
};
const removeHost = (host = '', hosts) => {
    const index = hosts.findIndex(h => helpers_1.areEqual(h.name, host));
    if (index > -1)
        hosts.splice(index, 1);
};
const addPlayer = (name, players) => {
    if (!name || hasUser(name, players))
        return;
    players.push(Object.assign(Object.assign({}, data_types_1.DefaultSlot), { name, history: [] }));
};
/**
 * Updates the given player in the given players array.
 * @param name - The name of the player to update
 * @param players - The array of players--this is mutated.
 * @param options - A list of fields to change, with new values
 */
const updatePlayer = (name, players, options) => {
    const player = players.find(p => helpers_1.areEqual(name, p.name));
    if (player)
        lodash_1.merge(player, options);
};
const replacePlayer = (oldName, newName, game) => {
    const { players, voteCount } = game;
    if (oldName && newName && !helpers_1.areEqual(oldName, newName)) {
        // Check if the player we're trying to replace in is already in the game
        if (hasUser(newName, players))
            return;
        // Grab the old player's slot w/ case insensitivity
        const player = players.find(p => helpers_1.areEqual(oldName, p.name));
        if (!player)
            return;
        // Grab the actual name we were using to key the player
        oldName = player.name;
        // Update the player's slot info
        player.history.push(oldName);
        player.name = newName;
        voteCount[newName] = voteCount[oldName];
        delete voteCount[oldName];
        // Update the votecount to reflect the player change
        Object.keys(voteCount).forEach(k => (voteCount[k] = voteCount[k].map(n => (n === oldName ? newName : n))));
    }
};
/**
 * Updates the given game config.
 * @param config - the old config
 * @param options - the new options to merge in
 */
const updateConfig = (config, options) => lodash_1.merge(config, options);
//# sourceMappingURL=apply-commands.js.map