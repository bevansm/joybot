import { isAtMajority } from '../user-utils';
import { createSlot, Vote } from '../../model/game-types';

describe('user utils tests', () => {
  describe('maj tests', () => {
    const voters: Vote[] = [
      { slotNumber: 0, weight: 1 },
      { slotNumber: 2, weight: 3 },
    ];
    it('should not return true if a player has no votes and maj > 0', () =>
      expect(isAtMajority(createSlot(), 1)).toBe(false));
    it('should return true if a player has no votes and maj == 0', () =>
      expect(isAtMajority(createSlot(), 0)).toBe(true));
    it('should return false if a player is not at maj', () => {
      const slot = createSlot({ votedBy: voters });
      expect(isAtMajority(slot, 5)).toBe(false);
    });
    it('should return true if a player is at maj', () => {
      const slot = createSlot({ votedBy: voters });
      expect(isAtMajority(slot, 4)).toBe(true);
    });
    it('should return true if a player exceeds maj', () => {
      const slot = createSlot({ votedBy: voters });
      expect(isAtMajority(slot, 3)).toBe(true);
    });
    it('should return false if a player is at maj but takes extra votes to lynch', () => {
      const slot = createSlot({ votedBy: voters, extraVotesToLynch: 1 });
      expect(isAtMajority(slot, 4)).toBe(false);
    });
    it('should return true if a player is not maj but takes less votes to lynch', () => {
      const slot = createSlot({ votedBy: voters, extraVotesToLynch: -1 });
      expect(isAtMajority(slot, 5)).toBe(true);
    });
  });
});
