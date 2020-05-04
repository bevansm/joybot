import romanize from 'romanjs';
import { INamed } from './models/data-types';

export const isValidHex = (hex: string): boolean =>
  RegExp(`^#(?:[0-9a-fA-F]{3}){1,2}$`).test(hex);

export const isEqual = (str1: string, str2: string): boolean =>
  str1.toUpperCase() === str2.toUpperCase();

export const numOrUndefined = (str: string): number => {
  if (!str) return undefined;
  const parsed = Number(str);
  return isNaN(parsed) ? undefined : parsed;
};

export const numeralOrUndefined = (str: string): number => {
  try {
    return romanize.decimal(str);
  } catch (e) {
    return undefined;
  }
};

export const boolOrUndefined = (str: string): boolean => {
  if (!str) return undefined;
  if (isEqual(str, 'false')) return false;
  if (isEqual(str, 'true')) return true;
  return undefined;
};

export const splitAndFormat = (str: string, delim: string): string[] =>
  str
    .split(delim)
    .map(s => s.trim())
    .filter(Boolean);

export const hasUser = (user: string, users: INamed[]): boolean =>
  !users.every(u => !isEqual(user, u.name));

export const getUser = (user: string, users: INamed[]): INamed =>
  users.find(u => isEqual(user, u.name));
