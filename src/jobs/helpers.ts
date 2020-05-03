export const isValidHex = (hex: string): boolean =>
  RegExp(`^#(?:[0-9a-fA-F]{3}){1,2}$`).test(hex);

export const areEqual = (str1: string, str2: string): boolean =>
  str1.toUpperCase() === str2.toUpperCase();

export const numOrUndefined = (str: string): number => {
  const parsed = Number(str);
  return isNaN(parsed) ? undefined : parsed;
};
