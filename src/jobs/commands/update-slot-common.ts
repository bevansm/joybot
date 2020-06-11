import { Slot } from '../../model/game-types';
import { removeVote } from './handle-player-command';

/**
 * Given a player, removes all votes they have placed.
 * @param player
 * @param players
 */
export const removeAllVotes = (player: Slot, players: Slot[]): void => {
  const { voting, slotNumber: playerSlotNumber } = player;
  voting.forEach(v => {
    const { slotNumber } = v;
    const votedPlayer = players[slotNumber];
    const { votedBy: votedVotedBy } = votedPlayer;
    votedPlayer.votedBy = removeVote(playerSlotNumber, votedVotedBy);
  });
  player.voting = [];
};
