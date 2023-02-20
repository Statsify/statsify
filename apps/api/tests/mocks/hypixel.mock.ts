/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GameCounts, Guild, Player, Status, Watchdog } from "@statsify/schemas";
import { HypixelService } from "../../src/hypixel";
import { MockClass } from "./mock.type";

export const hypixelService: MockClass<HypixelService> = {
  shouldCache: HypixelService.prototype.shouldCache,
  getPlayer: jest.fn().mockResolvedValue(new Player()),
  getGuild: jest.fn().mockResolvedValue(new Guild()),
  getRecentGames: jest.fn().mockResolvedValue([]),
  getStatus: jest.fn().mockResolvedValue(new Status({})),
  getWatchdog: jest.fn().mockResolvedValue(new Watchdog({})),
  getGameCounts: jest.fn().mockResolvedValue(new GameCounts()),
  getResources: jest.fn().mockResolvedValue({}),
};
