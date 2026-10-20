/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS_MODES, type BedWarsModes } from "@statsify/schemas";
import { type Game, gameStats, modeStats } from "./catalog.js";

/** The colours and labels of the bot's BedWars card (`bedwars.profile.tsx`); games played is the site's addition. */
export const BEDWARS: Game<BedWarsModes> = {
  key: "bedwars",
  id: "BEDWARS",
  modes: BEDWARS_MODES,
  game: {
    // The level's leaderboard ranks EXP; the session card shows EXP gained in §b.
    "exp": { colour: "§b" },
    "tokens": { colour: "§2" },
    "slumber.tickets": { colour: "§b", label: "stats.slumberTickets", of: "slumber.wallet" },
    "slumber.totalTickets": { colour: "§d", label: "stats.totalSlumberTickets" },
  },
  mode: {
    "wins": { colour: "§a" },
    "losses": { colour: "§c" },
    "wlr": { colour: "§6" },
    "finalKills": { colour: "§a" },
    "finalDeaths": { colour: "§c" },
    "fkdr": { colour: "§6" },
    "kills": { colour: "§a" },
    "deaths": { colour: "§c" },
    "kdr": { colour: "§6" },
    "bedsBroken": { colour: "§a" },
    "bedsLost": { colour: "§c" },
    "bblr": { colour: "§6" },
    "winstreak": { colour: "§a" },
    "gamesPlayed": { colour: "§e" },
    "itemsCollected.iron": { colour: "§7", label: "stats.iron" },
    "itemsCollected.gold": { colour: "§6", label: "stats.gold" },
    "itemsCollected.diamond": { colour: "§b", label: "stats.diamonds" },
    "itemsCollected.emerald": { colour: "§2", label: "stats.emeralds" },
  },
  // Challenges are stored per challenge, not as a mode's stats.
  statModes: BEDWARS_MODES.getApiModes().filter((mode) => mode !== "challenges"),
};

/** Every game in the catalog, by its `PlayerStats` key. */
export const GAMES: Record<string, Game> = { bedwars: BEDWARS };

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  const { Player, scanMetadata } = await import("@statsify/schemas");

  describe("the catalog", () => {
    for (const game of Object.values(GAMES)) {
      it(`resolves every ${game.key} entry in every mode`, () => {
        expect(() => gameStats(game)).not.toThrow();
        for (const mode of game.statModes) expect(() => modeStats(game, mode)).not.toThrow();
      });

      // A stat added to the schema fails here until it has an entry, so neither surface can miss it silently.
      it(`has an entry for every number a ${game.key} mode stores`, () => {
        const prefix = `stats.${game.key}.${game.statModes[0]}.`;
        const numbers = scanMetadata(Player)
          .filter(([path, { type }]) => path.startsWith(prefix) && type.type === Number && !type.array)
          .map(([path]) => path.slice(prefix.length));

        expect(Object.keys(game.mode).toSorted()).toEqual(numbers.toSorted());
      });
    }
  });
}
