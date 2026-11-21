/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";

export const KeySchema = s.object({
  name: s.string(),
  lifetimeRequests: s.number(),
  recentRequests: s.number(),
  resetTime: s.number(),
  limit: s.number(),
});

export type Key = s.infer<typeof KeySchema>;
