/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, catalogPaths, gameStats, modeStats, numberFields, playerFields } from "../catalog.js";
import { BEDWARS } from "./bedwars.js";
import { DUELS } from "./duels.js";

export { BEDWARS } from "./bedwars.js";
export { DUELS } from "./duels.js";

/** Every game in the catalog, by its `PlayerStats` key. */
export const GAMES: Record<string, Game> = { bedwars: BEDWARS, duels: DUELS };

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("the catalog", () => {
    for (const game of Object.values(GAMES)) {
      it(`resolves every ${game.key} entry where it is stored`, () => {
        expect(() => gameStats(game)).not.toThrow();
        for (const { modes } of game.shapes) for (const at of modes) expect(() => modeStats(game, at)).not.toThrow();
      });

      // A stat added to the schema fails here until it has an entry, so neither surface can miss it silently.
      it(`has an entry for every number a ${game.key} shape stores`, () => {
        for (const { modes, stats } of game.shapes) {
          for (const at of modes) {
            const prefix = `stats.${game.key}.${at}.`;
            // A deeper shape's stats are its own (`bridge.overall` below `bridge`), and a title's progression is the level's.
            const deeper = game.shapes.flatMap((shape) => shape.modes).filter((other) => other.startsWith(`${at}.`));
            const stored = numberFields(prefix)
              .filter((path) => !deeper.some((other) => path.startsWith(`stats.${game.key}.${other}.`)))
              .filter((path) => !path.startsWith(`${prefix}progression.`))
              .map((path) => path.slice(prefix.length));
            // An entry for a string is a selection the card shows (a kit), not a stat.
            const numbers = Object.keys(stats).filter((key) => playerFields().get(`${prefix}${key}`)?.type.type !== String);

            expect(numbers.toSorted(), `${game.key}.${at}`).toEqual(stored.toSorted());
          }
        }
      });

      // The same for the numbers stored once for the game, below none of its shapes. The level and any progression (a
      // title's) are the level panel's, and a cap shows after the stat it caps (`slumber.wallet`).
      it(`has an entry for every number ${game.key} stores for the whole game`, () => {
        const prefix = `stats.${game.key}.`;
        const places = game.shapes.flatMap(({ modes }) => modes);
        const caps = new Set(Object.values(game.game).flatMap(({ of }) => of ?? []));
        const stored = numberFields(prefix)
          .map((path) => path.slice(prefix.length))
          .filter((key) => !places.some((place) => key.startsWith(`${place}.`)))
          .filter((key) => key !== "level" && !/(^|\.)progression\./.test(key) && !caps.has(key));

        expect(stored.filter((key) => !(key in game.game))).toEqual([]);
      });

      it(`has an entry for every ${game.key} stat with a leaderboard`, () => {
        const described = new Set(catalogPaths(game));
        const ranked = numberFields(`stats.${game.key}.`).filter((path) => playerFields().get(path)?.leaderboard.enabled);
        expect(ranked.filter((path) => !described.has(path))).toEqual([]);
      });
    }
  });
}
