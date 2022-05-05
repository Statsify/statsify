import {
  Achievements,
  Friends,
  Player,
  RankedSkyWars,
  RecentGames,
  Status,
} from '@statsify/schemas';
import { PlayerService } from '../../src/player';
import { MockClass } from './mock.type';

export const playerService: MockClass<PlayerService> = {
  findOne: jest.fn().mockResolvedValue(new Player()),
  findFriends: jest.fn().mockResolvedValue(new Friends({})),
  findAchievements: jest.fn().mockResolvedValue({
    uuid: '',
    displayName: '',
    goldAchievements: true,
    achievements: new Achievements({}, {}),
  }),
  findRankedSkyWars: jest.fn().mockResolvedValue(new RankedSkyWars({})),
  findStatus: jest.fn().mockResolvedValue(new Status({})),
  findRecentGames: jest.fn().mockResolvedValue(new RecentGames()),
  deleteOne: jest.fn().mockResolvedValue(true),
};
