import { ISlot, createSlot } from './../../models/data-types';

// The list of substrings that joybot will look for
const playerlistTitles = ['playerlist', 'players'];
const playerlistSelectorString = playerlistTitles
  .map(p => `:icontains("${p}")`)
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
  const playerNames = ($(postContent)
    .find(playerlistSelectorString)
    .next('ol')
    .children('li')
    .map((_, e) => $(e).text().split(' ')[0].trim())
    .toArray() as unknown) as string[];
  return playerNames.map((name, slotNumber) =>
    createSlot({ name, slotNumber })
  );
};
