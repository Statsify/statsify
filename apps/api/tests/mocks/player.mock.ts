import { Friends, Player, RecentGames, Status } from '@statsify/schemas';
import { PlayerService } from '../../src/player';
import { MockClass } from './mock.type';

export const playerService: MockClass<PlayerService> = {
  get: jest.fn().mockResolvedValue(new Player()),
  getFriends: jest.fn().mockResolvedValue(new Friends({})),
  getStatus: jest.fn().mockResolvedValue(new Status({})),
  getRecentGames: jest.fn().mockResolvedValue(new RecentGames()),
  delete: jest.fn().mockResolvedValue(true),
};
