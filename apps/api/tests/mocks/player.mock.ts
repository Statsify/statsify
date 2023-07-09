/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MockClass } from "./mock.type.js";
import { Player, RecentGames, Status } from "@statsify/schemas";
import { PlayerService } from "../../src/player";

export const playerService: MockClass<PlayerService> = {
  get: vi.fn().mockResolvedValue(new Player()),
  getStatus: vi.fn().mockResolvedValue(new Status({})),
  getRecentGames: vi.fn().mockResolvedValue(new RecentGames()),
  delete: vi.fn().mockResolvedValue(true),
};
