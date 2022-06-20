/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Friends, Gamecounts, Guild, Player, Status, Watchdog } from '@statsify/schemas';
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
  getResources: jest.fn().mockResolvedValue({}),
  updateResources: jest.fn(),
};
