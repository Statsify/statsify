/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HistoricalService } from "../../src/historical/index.js";
import { MockClass } from "./mock.type.js";
import { Player } from "@statsify/schemas";
import { vi } from "vitest";

export const historicalService: MockClass<HistoricalService> = {
  resetPlayers: vi.fn(),
  getAndReset: vi.fn().mockResolvedValue(new Player()),
  reset: vi.fn().mockResolvedValue(new Player()),
  get: vi.fn().mockResolvedValue(new Player()),
};
