import { IVote } from './../../models/data-types';
import { hasUser } from './../helpers';
import { ISlot, IGame } from '../../models/data-types';
import { getUser } from '../helpers';
import { removeAllVotes } from './update-slot-common';

export enum PlayerCommands {
  VOTE = 'vote',
  UNVOTE = 'unvote',
}

/**
 * @param command - a command in the form /abcdef
 * @param rawName - the name of the player who made the command
 * @param game
 * @returns the lynched player if the game reached majority, null otherwise
 */
export const handlePlayerCommand = (
  commandString: string,
  rawName: string,
  game: IGame
): ISlot => {
  const {
    players,
    config: { majority },
  } = game;

  const player = getUser(rawName, players) as ISlot;
  if (!player) return null;

  const commands = commandString
    .split('/')
    .map(c => c.trim())
    .filter(c => !!c);
  while (commands.length > 0) {
    const args = commands
      .pop()
      .split(' ')
      .map(c => c.trim());
    const target = getUser(args[1] || '', players) as ISlot;

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
        if (target) {
          target.votedBy = removeVote(playerSlot, targetVotedBy);
          player.voting = removeVote(targetSlot, playerVoting);
        } else {
          removeAllVotes(player, players);
        }
        break;
      case PlayerCommands.VOTE:
        if (!target) {
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
        if (isLynched(target, majority)) return target;
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

const sumVotes = (votes: IVote[]): number =>
  votes.reduce((acc, v) => acc + v.weight, 0);

const isLynched = (player: ISlot, majority: number): boolean => {
  const { votedBy, extraVotesToLynch } = player;
  return sumVotes(votedBy) - extraVotesToLynch >= majority;
};
