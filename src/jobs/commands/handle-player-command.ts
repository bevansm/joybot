import { isAtMajority, sumVotes, inferUser } from './../../utils/user-utils';
import { IVote, ISlot, IGame } from '../../models/data-types';
import { splitAndFormat } from '../../utils/format-utils';
import { getUser } from '../../utils/user-utils';
import { removeAllVotes } from './update-slot-common';

export enum PlayerCommands {
  VOTE = 'vote',
  UNVOTE = 'unvote',
}

/**
 * @param command - a command in the form /abcdef
 * @param playerName - the name of the player who made the command
 * @param game
 * @returns the lynched player if the game reached majority, null otherwise
 */
export const handlePlayerCommand = (
  commandString: string,
  playerName: string,
  game: IGame
): ISlot => {
  const {
    players,
    config: { majority },
  } = game;

  const player = getUser(playerName, players) as ISlot;
  if (!player) return null;

  const commands = splitAndFormat(commandString, '/');
  while (commands.length > 0) {
    const args = commands
      .pop()
      .split(' ')
      .map(c => c.trim());
    const target = inferUser(args[1] || '', players) as ISlot;

    const {
      voting: playerVoting,
      slotNumber: playerSlot,
      canSplitVote: playerCanSplitVote,
      voteWeight: playerVoteWeight,
    } = player;
    const votesFromPlayerWeight = sumVotes(playerVoting);
    const playerHasVotes = playerVoteWeight < votesFromPlayerWeight;

    const { slotNumber: targetSlot, votedBy: targetVotedBy = [] } =
      target || {};

    let playerVote: IVote;
    let targetVote: IVote;
    let prevTarget: ISlot;

    switch (args[0].toLowerCase()) {
      case PlayerCommands.UNVOTE:
        if (args[1] && target) {
          target.votedBy = removeVote(playerSlot, targetVotedBy);
          player.voting = removeVote(targetSlot, playerVoting);
        } else {
          removeAllVotes(player, players);
        }
        break;
      case PlayerCommands.VOTE:
        if (!target || !target.isAlive) {
          break;
        } else if (playerCanSplitVote && playerHasVotes) {
          targetVote = { slotNumber: playerSlot, weight: 1 };
          target.votedBy = addVote(targetVote, targetVotedBy);

          playerVote = { slotNumber: targetSlot, weight: 1 };
          player.voting = addVote(playerVote, playerVoting);
        } else if (!playerCanSplitVote) {
          targetVote = { slotNumber: playerSlot, weight: playerVoteWeight };
          target.votedBy = addVote(targetVote, targetVotedBy);

          // If the player was previously voting someone, unvote them.
          if (playerVoting[0]) {
            prevTarget = players[playerVoting[0].slotNumber];
            prevTarget.votedBy = removeVote(playerSlot, prevTarget.votedBy);
          }

          playerVote = {
            slotNumber: targetSlot,
            weight: playerVoteWeight,
          };
          player.voting = [playerVote];
        }
        if (isAtMajority(target, majority)) return target;
        break;
      default:
        break;
    }
  }
  return null;
};

export const removeVote = (slotNumber: number, votes: IVote[]): IVote[] =>
  votes.filter(v => v.slotNumber !== slotNumber);

const addVote = (vote: IVote, votes: IVote[]): IVote[] => [...votes, vote];

export default handlePlayerCommand;
