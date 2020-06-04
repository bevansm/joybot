import { merge, isUndefined, isInteger } from 'lodash';

import {
  IHost,
  ISlot,
  IGame,
  createSlot,
  IConfig,
} from '../../model/data-types';

import { createPlayerlist as createPlayerlistHelper } from './create-playerlist';
import {
  isValidHex,
  isEqual,
  numOrUndefined,
  boolOrUndefined,
} from '../../utils/format-utils';
import { hasUser, getUser, findMaj } from '../../utils/user-utils';
import { removeAllVotes } from './update-slot-common';
import logger, { Level } from '../../logger/Logger';

export enum HostCommands {
  PRINT = 'print',
  RESET = 'reset',
  HOST_ADD = 'add-host',
  HOST_REMOVE = 'remove-hosts',
  HOST_COLOR = 'set-host-color',
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
export const handleHostCommand = (
  game: IGame,
  commandString: string,
  $?: CheerioStatic,
  postContent?: CheerioElement
): boolean | undefined => {
  const startCommand = process.env.START_COMMAND.toUpperCase();
  return commandString
    .substring(commandString.toUpperCase().indexOf(startCommand) + 1)
    .split('--')
    .reduce<undefined | boolean>((a, c) => {
      const res = applyCommand(game, c.trim(), $, postContent);
      return isUndefined(res) ? a : res;
    }, undefined);
};

/**
 * Applies the given command.
 * Note: This mutates the given IGame.
 * @param game
 * @param command
 * @param $
 * @param postContent
 * @returns if the command should trigger a print.
 */
export const applyCommand = (
  game: IGame,
  command: string,
  $?: CheerioStatic,
  postContent?: CheerioElement
): boolean | undefined => {
  const args = command.split(' ').map(c => c.trim());
  const numArg1 = numOrUndefined(args[1]);
  const numArg2 = numOrUndefined(args[2]);
  const boolArg1 = boolOrUndefined(args[1]);
  const boolArg3 = boolOrUndefined(args[3]);
  const { hosts, players, config } = game;
  logger.log(Level.DEBUG, 'Handling host command', { command, args });

  switch (args[0]) {
    case HostCommands.PRINT:
      if (!isUndefined(boolArg1)) return boolArg1;
    case HostCommands.RESET:
      players.forEach(p => {
        p.votedBy = [];
        p.voting = [];
      });
      updateConfig(config, { majority: findMaj(players) });
      break;
    case HostCommands.HOST_ADD:
      addHost(args[1], args[2], hosts);
      break;
    case HostCommands.HOST_REMOVE:
      removeHost(args[1], hosts);
      break;
    case HostCommands.HOST_COLOR:
      updateHostColor(args[1], hosts, args[2]);
      break;
    case HostCommands.PLAYERLIST:
      createPlayerlist(game, $, postContent);
      updateConfig(config, { majority: findMaj(game.players) });
      break;
    case HostCommands.PLAYER_ADD:
      args.slice(1).map(p => addPlayer(p, players));
      break;
    case HostCommands.PLAYER_KILL:
      args.slice(1).map(p => updatePlayer(p, players, { isAlive: false }));
      break;
    case HostCommands.PLAYER_REPLACE:
      replacePlayer(args[1], args[2], game);
      break;
    case HostCommands.CHANGE_WEIGHT:
      updatePlayerVoteWeight(args[1], players, numArg2, boolArg3);
      break;
    case HostCommands.CHANGE_VOTES_NEEDED:
      updatePlayer(args[1], players, { extraVotesToLynch: numArg2 });
      break;
    case HostCommands.MAJORITY:
      updateConfig(config, { majority: numArg1 });
      break;
    case HostCommands.EVERY:
      updateConfig(config, { interval: numArg1 });
      break;
    case HostCommands.AUTOLOCK:
      updateConfig(config, { autolock: Boolean(args[1]) });
      break;
    default:
    // Do nothing
  }
  return undefined;
};

export const addHost = (
  name: string,
  hex: string = '',
  hosts: IHost[]
): void => {
  if (!name || hasUser(name, hosts)) return;
  if (isValidHex(hex)) hosts.push({ name, hex });
  else hosts.push({ name, hex: '#000' });
};

const removeHost = (host: string = '', hosts: IHost[]): void => {
  const index = hosts.findIndex(h => isEqual(h.name, host));
  if (index > -1) hosts.splice(index, 1);
};

const updateHostColor = (
  name: string = '',
  hosts: IHost[],
  color: string
): void => {
  const host = getUser(name, hosts) as IHost;
  if (!host || !isValidHex(color)) return;
  host.hex = color;
};

const addPlayer = (name: string, players: ISlot[]): void => {
  if (!name || hasUser(name, players)) return;
  players.push(createSlot({ name }));
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
  const player = getUser(name, players);
  if (player) merge(player, options);
};

const replacePlayer = (oldName: string, newName: string, game: IGame): void => {
  const { players } = game;
  if (oldName && newName && !isEqual(oldName, newName)) {
    // Check if the player we're trying to replace in is already in the game
    if (hasUser(newName, players)) return;

    // Grab the old player's slot w/ case insensitivity
    const player = getUser(oldName, players) as ISlot;
    if (!player) return;

    // Grab the actual name we were using to key the player
    oldName = player.name;

    // Update the player's slot info
    player.history.push(oldName);
    player.name = newName;
  }
};

const updatePlayerVoteWeight = (
  name: string,
  players: ISlot[],
  weight: number,
  splitVote: boolean
): void => {
  const player = getUser(name, players) as ISlot;
  if (player && (!isUndefined(weight) || !isUndefined(splitVote))) {
    removeAllVotes(player, players);
    const options: Partial<ISlot> = {
      voteWeight: weight,
      canSplitVote: Boolean(splitVote),
    };
    merge(player, options);
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

export default handleHostCommand;
