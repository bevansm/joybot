import { parsePrefix, parseTitle } from './../parse-title-info';
import { parseGameInfo } from '../parse-title-info';
import { IGameInfo, GameType } from '../../../models/data-types';

interface ISampleInfo {
  raw: string;
  parsed: IGameInfo;
}
const samples: ISampleInfo[] = [
  {
    raw: 'VFM68: Twitch Chat FM D1 - Kreygasm',
    parsed: {
      title: 'Twitch Chat FM',
      type: GameType.VFM,
      gameNumber: 68,
    },
  },
  {
    raw: '19D - NFMNFM2 - Town Wins!',
    parsed: {
      title: 'NFMNFM2',
      type: GameType.STANDARD,
      gameNumber: 19,
      letter: 'D',
    },
  },
  {
    raw: 'XX2 / Slightly Damned Mafia / Sadly Canned',
    parsed: {
      title: 'Slightly Damned Mafia',
      gameNumber: 2,
      type: GameType.STANDARD,
      letter: 'XX',
    },
  },
  {
    raw: 'AFFM2020 | Heavy Is Dead',
    parsed: {
      title: 'Heavy Is Dead',
      gameNumber: 2020,
      type: GameType.APRILFOOLS,
    },
  },
  {
    raw: 'SFM 67: Christmas Paranoia Mafia-Game Over-Christmas Saved?',
    parsed: {
      title: 'Christmas Paranoia Mafia',
      gameNumber: 67,
      type: GameType.SFM,
    },
  },
  {
    raw: 'VFM65 | FollowTheCop... or Not vol.2 |Endgame',
    parsed: {
      title: 'FollowTheCop... or Not vol.2',
      gameNumber: 65,
      type: GameType.VFM,
    },
  },
  {
    raw: 'VFM55: Cyclone Mage Sucks | Mafia Wins (Missed Lethal...)',
    parsed: {
      title: 'Cyclone Mage Sucks',
      gameNumber: 55,
      type: GameType.VFM,
    },
  },
  {
    raw: 'VFM59: Spooks Abound - Canned',
    parsed: {
      title: 'Spooks Abound',
      gameNumber: 59,
      type: GameType.VFM,
    },
  },
  {
    raw: 'Episode XIX | Setup',
    parsed: {
      title: 'Episode XIX',
      gameNumber: 19,
      type: GameType.EPISODE,
    },
  },
  {
    raw: 'NFM65 | Setup',
    parsed: {
      title: 'NFM65',
      gameNumber: 65,
      type: GameType.NFM,
    },
  },
  {
    raw: '[Newcomer FM] NFM60 | Game Over | Town Wins',
    parsed: {
      title: 'NFM60',
      gameNumber: 60,
      type: GameType.NFM,
    },
  },
  {
    raw: 'ASG2 | Game Over (Town Wins)',
    parsed: {
      title: 'ASG2',
      gameNumber: 2,
      type: GameType.ALL_STARS,
    },
  },
  {
    raw: 'FM Game 4E [Town & Executioner Win!] "Marathon Achievement"',
    parsed: {
      title: 'Marathon Achievement',
      gameNumber: 4,
      type: GameType.STANDARD,
      letter: 'E',
    },
  },
];

describe('parse title info', () => {
  describe('parse full info', () =>
    samples.forEach(sample => {
      const { raw, parsed } = sample;
      it(`should be able to parse ${raw}`, () => {
        expect(parseGameInfo(raw)).toEqual(parsed);
      });
    }));

  describe('parse title', () => {
    it('should be able to parse a quoted title', () =>
      expect(parseTitle('"Pie Masters"')).toBe('Pie Masters'));
    it('should be able to parse a title with day/night phases', () =>
      expect(parseTitle('The Boonies D4')).toBe('The Boonies'));
  });

  describe('parse prefix', () => {
    it('should be able to parse an episodical prefix', () =>
      expect(parsePrefix('Episode X')).toEqual({
        type: GameType.EPISODE,
        gameNumber: 10,
      }));
    it('should be able to parse a SFM prefix with spaces', () =>
      expect(parsePrefix('SFM 70')).toEqual({
        type: GameType.SFM,
        gameNumber: 70,
      }));
    it('should be able to parse a standard', () =>
      expect(parsePrefix('14D')).toEqual({
        type: GameType.STANDARD,
        gameNumber: 14,
        letter: 'D',
      }));
    it('should be able to parse a legacy standard', () =>
      expect(parsePrefix('FM Game 2C')).toEqual({
        type: GameType.STANDARD,
        gameNumber: 2,
        letter: 'C',
      }));
    it('should be able to parse a legacy episode', () =>
      expect(parsePrefix('FM Episode V')).toEqual({
        type: GameType.EPISODE,
        gameNumber: 5,
      }));
    it('should be able to parse another legacy episode', () =>
      expect(parsePrefix('Forum Mafia Episode IV')).toEqual({
        type: GameType.EPISODE,
        gameNumber: 4,
      }));
    it('should be able to parse a nfm game', () =>
      expect(parsePrefix('[Newcomer FM] NFM64')).toEqual({
        type: GameType.NFM,
        gameNumber: 64,
      }));
    it('should return undefined for the number if there is none', () =>
      expect(parsePrefix('NFM')).toEqual({
        type: GameType.NFM,
        gameNumber: undefined,
      }));
    it('should return undefined for the number if there is none', () =>
      expect(parsePrefix('Episode Poop')).toEqual({
        type: GameType.EPISODE,
        gameNumber: undefined,
      }));
    it('should maintain periods in the episode numbers', () =>
      expect(parsePrefix('Episode 12.3')).toEqual({
        type: GameType.EPISODE,
        gameNumber: 12.3,
      }));
    it('should maintain periods in SFM numbers', () =>
      expect(parsePrefix('SFM1.5')).toEqual({
        type: GameType.SFM,
        gameNumber: 1.5,
      }));
    it('should parse an ASG game', () =>
      expect(parsePrefix('ASG2')).toEqual({
        type: GameType.ALL_STARS,
        gameNumber: 2,
      }));
    it('should correctly handle *E games as standards', () =>
      expect(parsePrefix('4E')).toEqual({
        type: GameType.STANDARD,
        gameNumber: 4,
        letter: 'E',
      }));
    it('should correctly handle event games', () =>
      expect(parsePrefix('E0')).toEqual({
        type: GameType.EVENT,
        gameNumber: 0,
      }));
  });
});
