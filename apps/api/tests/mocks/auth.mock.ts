/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AuthService } from "../../src/auth/auth.service";
import { MockClass } from "./mock.type";
import { testUuid } from "../test.constants";

export const authService: MockClass<AuthService> = {
  limited: jest.fn().mockResolvedValue({
    canActivate: true,
    used: 0,
    limit: 999,
    resetTime: 999,
  }),
  createKey: jest.fn().mockResolvedValue(testUuid),
  getKey: jest.fn(),
};
