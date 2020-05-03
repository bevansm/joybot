import { IVote } from './../../models/data-types';
import { hasUser } from './../helpers';
import { ISlot, IGame } from '../../models/data-types';
import { getUser } from '../helpers';

export enum PlayerCommands {
  VOTE = 'vote',
  UNVOTE = 'unvote',
}

/**
 * This is ugly.
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

  const commands = commandString.split('/').map(c => c.trim());

  while (commands.length > 0) {
    const args = commands
      .pop()
      .split(' ')
      .map(c => c.trim());
    const command = args[0];
    const target = getUser(args[1], players) as ISlot;

    const {
      voting: playerVoting,
      slotNumber: playerSlot,
      canVoteCount: playerCanVote,
      voteWeight: playerVoteWeight,
    } = player;
    const votesFromPlayerWeight = sumVotes(playerVoting);

    const { slotNumber: targetSlot, votedBy: targetVotedBy = [] } = target;

    let playerVote: IVote;
    let targetVote: IVote;
    let prevTarget: ISlot;

    switch (command.toLowerCase()) {
      case PlayerCommands.UNVOTE:
        if (target) {
          target.votedBy = removeVote(playerSlot, targetVotedBy);
          player.voting = removeVote(targetSlot, playerVoting);
        } else {
          player.voting.forEach(v => {
            const { slotNumber } = v;
            const votedPlayer = players[slotNumber];
            const { votedBy: votedVotedBy } = votedPlayer;
            votedPlayer.votedBy = removeVote(playerSlot, votedVotedBy);
          });
          player.voting = [];
        }
        break;
      case PlayerCommands.VOTE:
        if (!target) {
          break;
        } else if (
          playerCanVote > 1 &&
          playerVoteWeight < votesFromPlayerWeight
        ) {
          playerVote = { slotNumber: targetSlot, weight: 1 };
          targetVote = { slotNumber: playerSlot, weight: 1 };
          target.votedBy = addVote(targetVote, targetVotedBy);
          player.voting = addVote(playerVote, playerVoting);

          if (isLynched(target, majority)) return target;
        } else if (playerCanVote === 1) {
          playerVote = { slotNumber: targetSlot, weight: playerVoteWeight };
          targetVote = { slotNumber: playerSlot, weight: playerVoteWeight };

          target.votedBy = addVote(targetVote, targetVotedBy);

          prevTarget = players[playerVoting[0].slotNumber];
          prevTarget.votedBy = removeVote(
            playerVoting[0].slotNumber,
            prevTarget.votedBy
          );

          player.voting = [playerVote];

          if (isLynched(target, majority)) return target;
        }
        break;
      default:
        break;
    }
  }
  return null;
};

const removeVote = (slotNumber: number, votes: IVote[]): IVote[] =>
  votes.filter(v => v.slotNumber !== slotNumber);

const addVote = (vote: IVote, votes: IVote[]): IVote[] => [...votes, vote];

const sumVotes = (votes: IVote[]): number =>
  votes.reduce((acc, v) => acc + v.weight, 0);

const isLynched = (player: ISlot, majority: number): boolean => {
  const { votedBy, extraVotesToLynch } = player;
  return sumVotes(votedBy) - extraVotesToLynch >= majority;
};
