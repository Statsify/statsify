/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Redis } from "ioredis";
import { config } from "@statsify/util";

const redisUrl = config("database.redisUrl");

export const redis = new Redis(redisUrl);
