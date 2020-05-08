import { roman } from 'romanjs';
import { numeralOrUndefined } from '../../utils/format-utils';
import {
  splitAndFormat,
  numOrUndefined,
  isEqual,
} from '../../utils/format-utils';
import { IGameInfo, GameType, createInfo } from '../../dataclient/data-types';
import logger, { Level } from '../../logger/Logger';
import { isUndefined } from 'lodash';

export const parseGameInfo = (rawInfo: string): IGameInfo => {
  const delim = findDelim(rawInfo);
  const titleArray = delim ? splitAndFormat(rawInfo, delim) : [rawInfo];
  const { type, gameNumber, letter } = parsePrefix(titleArray[0]);
  let title;
  if (titleArray[1]) {
    title = parseTitle(titleArray[1], titleArray.length <= 2);
  } else if (rawInfo.indexOf('[') > 0) {
    title = parseTitle(rawInfo.substring(rawInfo.indexOf(']') + 1), false);
  } else if (rawInfo.indexOf('(') > 0) {
    title = parseTitle(rawInfo.substring(rawInfo.indexOf(')') + 1), false);
  }

  if (type && gameNumber && !title) {
    switch (type) {
      case GameType.EPISODE:
        title = `Episode ${roman(gameNumber)}`;
        break;
      case GameType.STANDARD:
        title = `${gameNumber}${letter}`;
        break;
      default:
        title = `${type}${gameNumber}`;
        break;
    }
  }

  const config: Partial<IGameInfo> = {
    type: type as GameType,
    title,
    gameNumber,
    letter,
  };
  if (!type || !gameNumber || !title) {
    logger.log(Level.ERROR, `failed to parse game info`, {
      rawInfo,
      ...config,
    });
  } else {
    logger.log(Level.DEBUG, `created info for ${gameNumber}`, {
      ...config,
      rawInfo,
    });
  }

  return createInfo(config);
};

/**
 * Returns the first delim found in the given string.
 * @param str
 */
const delimitators = ['|', ':', '-', '/', '"'];
const findDelim = (str: string): string => {
  let delim;
  let minIndex = Infinity;
  delimitators.forEach(d => {
    const index = str.indexOf(d);
    if (index > -1 && index < minIndex) {
      delim = d;
      minIndex = index;
    }
  });
  return delim;
};

const oldPrefixes = ['Forum Mafia', 'FM Game', '[Newcomer FM]'];
export const parsePrefix = (
  rawPrefix: string
): { type: string; gameNumber: number; letter: string } => {
  // Preformat the string, removing old prefixes and unnessecary strings
  oldPrefixes.forEach(op => {
    const rawUpper = rawPrefix.toUpperCase();
    const oldPrefixUpper = op.toUpperCase();
    const index = rawUpper.indexOf(oldPrefixUpper);
    if (index > -1) rawPrefix = rawPrefix.substring(index + op.length).trim();
  });
  const prefix = splitAndFormat(rawPrefix, ' ');
  if (isEqual(prefix[0], 'FM')) prefix.shift();

  // First considers the case where there's a space in the prefix
  let type = prefix[0];
  let gameNumber = numOrUndefined(prefix[1]) || numeralOrUndefined(prefix[1]);
  let letter;

  // If there is no number in a space version, try to pull off the number from the string
  // Handles prefixes in the form ABC123 and 123ABC
  if (!gameNumber) {
    const args = prefix[0].match(/[a-z]+|[\d|.]+/gi);
    const numArg1 = numOrUndefined(args[1]);
    const numArg0 = numOrUndefined(args[0]);
    if (!isUndefined(numArg1)) {
      type = args[0];
      gameNumber = numArg1;
    } else if (!isUndefined(numArg0)) {
      type = args[1];
      gameNumber = numArg0;

      // Handles standard/event naming conflicts.
      // WARN: This must be handled for any single character game types.
      if (type === GameType.EVENT) {
        letter = type;
        type = GameType.STANDARD;
      }
    }
  }

  if (type && !Object.values(GameType).includes(type as GameType)) {
    if (isEqual(type, 'Episode') || isEqual(type, 'Game')) {
      type = GameType.EPISODE;
    } else if (/^[a-zA-Z]+$/.test(type)) {
      letter = type.toUpperCase();
      type = GameType.STANDARD;
    } else {
      type = undefined;
    }
  }

  return { type, gameNumber, letter };
};

/**
 * Parses the title
 * @param title
 * @param hasDelims - if the title may still have delims to consider
 */
const commentTags = ['[', '('];
export const parseTitle = (
  rawTitle: string = '',
  hasDelims: boolean = false
): string => {
  let title = rawTitle;
  if (hasDelims) {
    const delim = findDelim(rawTitle);
    title = splitAndFormat(rawTitle, delim)[0];
  }

  // Kill mod comments (i.e. (Mafia wins!) or [a big break])
  commentTags.forEach(t => {
    const index = title.indexOf(t);
    if (index > -1) title = title.substring(0, index);
  });

  // Remove phase markers
  const trimmedPhase = /(.*)(?:(?:(?:Day|Night|D|N) *\d+)|(?:(?:Game Over|Setup)))/gi.exec(
    title
  );
  if (trimmedPhase && !isUndefined(trimmedPhase[1])) title = trimmedPhase[1];
  title = title.trim();

  return title.trim().replace(/"/g, '');
};
