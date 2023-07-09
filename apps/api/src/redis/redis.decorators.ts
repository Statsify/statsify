/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Inject } from "@nestjs/common";
import { getRedisConnectionToken } from "./redis.utils.js";

export const InjectRedis = (connection?: string) =>
  Inject(getRedisConnectionToken(connection));
