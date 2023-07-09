/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AuthService } from "../../src/auth/auth.service.js";
import { testUuid } from "../test.constants.js";
import { vi } from "vitest";
import type { MockClass } from "./mock.type.js";

export const authService: MockClass<AuthService> = {
  limited: vi.fn().mockResolvedValue({
    canActivate: true,
    used: 0,
    limit: 999,
    resetTime: 999,
  }),
  createKey: vi.fn().mockResolvedValue(testUuid),
  getKey: vi.fn(),
};
