/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getLeaderboardFields } from "@statsify/schemas";
import { z } from "zod";
import type { Constructor } from "@statsify/util";

// Zod's default message would list every leaderboard field
export const leaderboardField = (constructor: Constructor<unknown>) =>
  z.enum(getLeaderboardFields(constructor).map(([key]) => key), {
    error: "Invalid leaderboard field",
  });
