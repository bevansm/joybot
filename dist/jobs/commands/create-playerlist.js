"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.createPlayerlist = ($, postContent) => {
    const playerlists = $(postContent).find(playerlistSelectorString).next('ol');
    console.log(playerlists.length);
    return null;
};
//# sourceMappingURL=create-playerlist.js.map