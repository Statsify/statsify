/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";

export const CommandsSchema = s.model("Commands", {
  name: s.string().index({ unique: true }),
  usage: s.record(s.number()),
});

export type Commands = s.infer<typeof CommandsSchema>;
