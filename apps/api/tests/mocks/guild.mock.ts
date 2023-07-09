/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Guild } from "@statsify/schemas";
import { GuildService } from "../../src/guild/index.js";
import { MockClass } from "./mock.type.js";
import { vi } from "vitest";

export const guildService: MockClass<GuildService> = {
  get: vi.fn().mockResolvedValue(new Guild()),
};
