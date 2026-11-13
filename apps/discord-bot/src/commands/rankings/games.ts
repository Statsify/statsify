/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PlayerStats, PlayerStatsSchema } from "@statsify/schemas";
import { prettify, removeFormatting } from "@statsify/util";

export const removeGameDash = (game: string) => game.replace(" -", "");

export const games = Object.entries(PlayerStatsSchema.definition).map(([key, value]) => {
  const name = value.meta.leaderboard?.fieldName ?? prettify(key);

  return {
    key: key as keyof PlayerStats,
    name: removeGameDash(removeFormatting(name)),
    formatted: name,
  };
});
