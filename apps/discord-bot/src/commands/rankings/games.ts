/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ClassMetadata, METADATA_KEY, PlayerStats } from "@statsify/schemas";
import { removeFormatting } from "@statsify/util";

export const removeGameDash = (game: string) => game.replace(" -", "");

export const games = Object.entries(
  Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype) as ClassMetadata
).map(([key, value]) => ({
  key: key as keyof PlayerStats,
  name: removeGameDash(removeFormatting(value.leaderboard.name)),
  formatted: value.leaderboard.name,
}));
