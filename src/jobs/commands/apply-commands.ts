import { createPlayerlist as createPlayerlistHelper } from './create-playerlist';
import { merge } from 'lodash';

import { isValidHex, areEqual } from '../helpers';
import {
  IHost,
  ISlot,
  IUser,
  IGame,
  DefaultSlot,
  IConfig,
} from '../../models/data-types';

export enum Commands {
  RESET = 'reset',
  HOST_ADD = 'add-host',
  HOST_REMOVE = 'remove-hosts',
  PLAYERLIST = 'create-playerlist',
  PLAYER_ADD = 'add-players',
  PLAYER_KILL = 'kill-players',
  PLAYER_REPLACE = 'replace-player',
  CHANGE_WEIGHT = 'change-weight',
  CHANGE_VOTES_NEEDED = 'change-votes-needed',
  MAJORITY = 'majority',
  EVERY = 'every',
  AUTOLOCK = 'autolock',
}

/**
 * Applies the given commands to the game. Note that this mutates the game object.
 * @param game
 * @param commandString
 * @param $
 * @param postContent
 */
export const applyCommands = (
  game: IGame,
  commandString: string,
  $?: CheerioStatic,
  postContent?: CheerioElement
): void => {
  const startCommand = process.env.START_COMMAND;
  commandString
    .substring(commandString.indexOf(startCommand) + 1)
    .split('--')
    .map(c => applyCommand(game, c.trim(), $, postContent));
};

/**
 * Applies the given command.
 * Note: This mutates the given IGame.
 * @param game
 * @param command
 * @param $
 * @param postContent
 */
export const applyCommand = (
  game: IGame,
  command: string,
  $?: CheerioStatic,
  postContent?: CheerioElement
): void => {
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
      createPlayerlist(game, $, postContent);
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

const hasUser = (user: string, users: IUser[]): boolean =>
  !users.every(u => !areEqual(user, u.name));

const addHost = (name: string, hex: string = '', hosts: IHost[]): void => {
  if (!name || hasUser(name, hosts)) return;
  if (isValidHex(hex)) hosts.push({ name, hex });
  else hosts.push({ name, hex: '#000' });
};

const removeHost = (host: string = '', hosts: IHost[]): void => {
  const index = hosts.findIndex(h => areEqual(h.name, host));
  if (index > -1) hosts.splice(index, 1);
};

const addPlayer = (name: string, players: ISlot[]): void => {
  if (!name || hasUser(name, players)) return;
  players.push({ ...DefaultSlot, name, history: [] });
};

/**
 * Updates the given player in the given players array.
 * @param name - The name of the player to update
 * @param players - The array of players--this is mutated.
 * @param options - A list of fields to change, with new values
 */
const updatePlayer = (
  name: string,
  players: ISlot[],
  options: Partial<ISlot>
): void => {
  const player = players.find(p => areEqual(name, p.name));
  if (player) merge(player, options);
};

const replacePlayer = (oldName: string, newName: string, game: IGame): void => {
  const { players, voteCount } = game;
  if (oldName && newName && !areEqual(oldName, newName)) {
    // Check if the player we're trying to replace in is already in the game
    if (hasUser(newName, players)) return;

    // Grab the old player's slot w/ case insensitivity
    const player = players.find(p => areEqual(oldName, p.name));
    if (!player) return;

    // Grab the actual name we were using to key the player
    oldName = player.name;

    // Update the player's slot info
    player.history.push(oldName);
    player.name = newName;
    voteCount[newName] = voteCount[oldName];
    delete voteCount[oldName];

    // Update the votecount to reflect the player change
    Object.keys(voteCount).forEach(
      k => (voteCount[k] = voteCount[k].map(n => (n === oldName ? newName : n)))
    );
  }
};

/**
 * Updates the given game config.
 * @param config - the old config
 * @param options - the new options to merge in
 */
const updateConfig = (config: IConfig, options: Partial<IConfig>): any =>
  merge(config, options);

/**
 * Updates the playerlist. See create-playerlist.ts for more information
 * @param game
 * @param $
 * @param postContent
 */
const createPlayerlist = (
  game: IGame,
  $: CheerioStatic,
  postContent: CheerioElement
): void => {
  const playerlist = createPlayerlistHelper($, postContent);
  if (playerlist.length > 0) game.players = playerlist;
};
