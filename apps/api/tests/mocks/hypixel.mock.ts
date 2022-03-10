import {
  Friends,
  Gamecounts,
  Guild,
  Player,
  RankedSkyWars,
  Status,
  Watchdog,
} from '@statsify/schemas';
import { HypixelService } from '../../src/hypixel';
import { MockClass } from './mock.type';

export const hypixelService: MockClass<HypixelService> = {
  shouldCache: HypixelService.prototype.shouldCache,
  getPlayer: jest.fn().mockResolvedValue(new Player()),
  getGuild: jest.fn().mockResolvedValue(new Guild()),
  getRecentGames: jest.fn().mockResolvedValue([]),
  getStatus: jest.fn().mockResolvedValue(new Status({})),
  getFriends: jest.fn().mockResolvedValue(new Friends({})),
  getWatchdog: jest.fn().mockResolvedValue(new Watchdog({})),
  getGamecounts: jest.fn().mockResolvedValue(new Gamecounts()),
  getRankedSkyWars: jest.fn().mockResolvedValue(new RankedSkyWars({})),
  getResources: jest.fn().mockResolvedValue({}),
  updateResources: jest.fn(),
};
