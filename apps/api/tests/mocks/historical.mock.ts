/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HistoricalService } from "../../src/historical";
import { MockClass } from "./mock.type";
import { Player } from "@statsify/schemas";

export const historicalService: MockClass<HistoricalService> = {
  resetPlayers: jest.fn(),
  getAndReset: jest.fn().mockResolvedValue(new Player()),
  reset: jest.fn().mockResolvedValue(new Player()),
  get: jest.fn().mockResolvedValue(new Player()),
};
