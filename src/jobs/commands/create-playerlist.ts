import { ISlot } from './../../models/data-types';

// The list of substrings that joybot will look for
const playerlistTitles = ['playerlist', 'players'];
const playerlistSelectorString = playerlistTitles
  .map(p => `:contains(${p})`)
  .join(', ');

/**
 * Parses the given post for a playerlist in the form:
 * Playerlist
 * <ol>
 *  <li>Player<li>
 *  <li>Player<li>
 *  ...
 *  <li>Player<li>
 * </ol>
 * @param $
 * @param postContent - the element with "class=content" inside a post.
 */
export const createPlayerlist = (
  $: CheerioStatic,
  postContent: CheerioElement
): ISlot[] => {
  const playerlists = $(postContent).find(playerlistSelectorString).next('ol');
  console.log(playerlists.length);
  return null;
};
