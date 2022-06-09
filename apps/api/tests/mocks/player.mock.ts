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
  get: jest.fn().mockResolvedValue(new Player()),
  getFriends: jest.fn().mockResolvedValue(new Friends({})),
  getAchievements: jest.fn().mockResolvedValue({
    uuid: '',
    displayName: '',
    goldAchievements: true,
    achievements: new Achievements({}, {}),
  }),
  getRankedSkyWars: jest.fn().mockResolvedValue(new RankedSkyWars({})),
  getStatus: jest.fn().mockResolvedValue(new Status({})),
  getRecentGames: jest.fn().mockResolvedValue(new RecentGames()),
  delete: jest.fn().mockResolvedValue(true),
};
