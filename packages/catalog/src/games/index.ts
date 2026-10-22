/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, catalogPaths, gameStats, modeStats, numberFields, playerFields } from "../catalog.js";
import { ARCADE } from "./arcade.js";
import { ARENA_BRAWL } from "./arenabrawl.js";
import { BEDWARS } from "./bedwars.js";
import { BLITZSG } from "./blitzsg.js";
import { BUILD_BATTLE } from "./buildbattle.js";
import { CHALLENGES } from "./challenges.js";
import { COPS_AND_CRIMS } from "./copsandcrims.js";
import { DUELS } from "./duels.js";
import { MEGAWALLS } from "./megawalls.js";
import { PAINTBALL } from "./paintball.js";
import { PARKOUR } from "./parkour.js";
import { PIT } from "./pit.js";
import { QUAKE } from "./quake.js";
import { SKYWARS } from "./skywars.js";
import { SMASH_HEROES } from "./smashheroes.js";
import { SPEED_UHC } from "./speeduhc.js";
import { TURBO_KART_RACERS } from "./turbokartracers.js";
import { UHC } from "./uhc.js";
import { VAMPIREZ } from "./vampirez.js";
import { WALLS } from "./walls.js";

export { ARCADE, DROPPER_DIFFICULTIES } from "./arcade.js";
export { ARENA_BRAWL } from "./arenabrawl.js";
export { BEDWARS } from "./bedwars.js";
export { BLITZSG } from "./blitzsg.js";
export { BUILD_BATTLE } from "./buildbattle.js";
export { CHALLENGES } from "./challenges.js";
export { COPS_AND_CRIMS } from "./copsandcrims.js";
export { DUELS } from "./duels.js";
export { MEGAWALLS } from "./megawalls.js";
export { PAINTBALL } from "./paintball.js";
export { PARKOUR } from "./parkour.js";
export { PIT } from "./pit.js";
export { QUAKE } from "./quake.js";
export { SKYWARS, SKYWARS_CHALLENGES } from "./skywars.js";
export { SMASH_HEROES } from "./smashheroes.js";
export { SPEED_UHC, SPEED_UHC_MASTERIES } from "./speeduhc.js";
export { TURBO_KART_RACERS } from "./turbokartracers.js";
export { UHC } from "./uhc.js";
export { VAMPIREZ } from "./vampirez.js";
export { WALLS } from "./walls.js";

/** Every game in the catalog, by its `PlayerStats` key. */
export const GAMES: Record<string, Game> = {
  arcade: ARCADE,
  arenabrawl: ARENA_BRAWL,
  bedwars: BEDWARS,
  blitzsg: BLITZSG,
  buildbattle: BUILD_BATTLE,
  challenges: CHALLENGES,
  copsandcrims: COPS_AND_CRIMS,
  duels: DUELS,
  megawalls: MEGAWALLS,
  paintball: PAINTBALL,
  parkour: PARKOUR,
  pit: PIT,
  quake: QUAKE,
  skywars: SKYWARS,
  smashheroes: SMASH_HEROES,
  speeduhc: SPEED_UHC,
  turbokartracers: TURBO_KART_RACERS,
  uhc: UHC,
  vampirez: VAMPIREZ,
  walls: WALLS,
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  /**
   * Numbers the schema stores that the catalog leaves out on purpose. Zombies has no overall fastest win (each map has
   * its own); #1012 drops the field from the schema.
   */
  const LEFT_OUT = new Set(["stats.arcade.zombies.overall.fastestWin"]);

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
              .filter((path) => !LEFT_OUT.has(path))
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
        expect(ranked.filter((path) => !described.has(path) && !LEFT_OUT.has(path))).toEqual([]);
      });
    }
  });
}
