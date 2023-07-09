/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GameCounts, Guild, Player, Status, Watchdog } from "@statsify/schemas";
import { HypixelService } from "../../src/hypixel/index.js";
import { MockClass } from "./mock.type.js";
import { vi } from "vitest";

export const hypixelService: MockClass<HypixelService> = {
  shouldCache: HypixelService.prototype.shouldCache,
  getPlayer: vi.fn().mockResolvedValue(new Player()),
  getGuild: vi.fn().mockResolvedValue(new Guild()),
  getRecentGames: vi.fn().mockResolvedValue([]),
  getStatus: vi.fn().mockResolvedValue(new Status({})),
  getWatchdog: vi.fn().mockResolvedValue(new Watchdog({})),
  getGameCounts: vi.fn().mockResolvedValue(new GameCounts()),
  getResources: vi.fn().mockResolvedValue({}),
};
