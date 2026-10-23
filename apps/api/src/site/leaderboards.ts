/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GAMES, type Stat, gameStats, modeStats } from "@statsify/catalog";
import type { LeaderboardColumn } from "@statsify/contract";

let catalog: Map<string, Stat> | undefined;

/** Every stat the catalog describes, by its path. */
function catalogStats(): Map<string, Stat> {
  catalog ??= new Map(
    Object.values(GAMES)
      .flatMap((game) => [
        ...gameStats(game),
        ...game.shapes.flatMap(({ modes }) => modes.flatMap((at) => modeStats(game, at))),
      ])
      .map((stat) => [stat.path, stat])
  );

  return catalog;
}

/**
 * A leaderboard's value column, with the label and colour the bot's cards give the stat. A stat the catalog doesn't
 * describe (some of General's) keeps the leaderboard's own name for the column.
 */
export function leaderboardColumn(field: string, name: string): LeaderboardColumn {
  const stat = catalogStats().get(field);
  return { field, name, label: stat?.label ?? null, colour: typeof stat?.colour === "string" ? stat.colour : null };
}
