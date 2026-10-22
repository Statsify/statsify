/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE_PAGE } from "./arcade.js";
import { BEDWARS_PAGE } from "./bedwars.js";
import { BLITZSG_PAGE } from "./blitzsg.js";
import { BUILD_BATTLE_PAGE } from "./buildbattle.js";
import { CHALLENGES_PAGE } from "./challenges.js";
import { DUELS_PAGE } from "./duels.js";
import { PAINTBALL_PAGE } from "./paintball.js";
import { PARKOUR_PAGE } from "./parkour.js";
import { PIT_PAGE } from "./pit.js";
import { QUAKE_PAGE } from "./quake.js";
import { TURBO_KART_RACERS_PAGE } from "./turbokartracers.js";
import { UHC_PAGE } from "./uhc.js";
import { WALLS_PAGE } from "./walls.js";
import { type GameId, GameIdMapping } from "@statsify/schemas";
import { type GameLayout, pageModes } from "./layout.js";

export { buildGamePage, pageModes, pageName } from "./layout.js";
export type { GameLayout } from "./layout.js";

/** Where a game comes in the game registry; a page that isn't a game's comes after every game. */
const REGISTRY = [...new Set(Object.values(GameIdMapping))];
const registryIndex = ({ game }: GameLayout) => (game.id ? REGISTRY.indexOf(game.id) : REGISTRY.length);

/**
 * The pages the site has, each at `/player/<name>/<its game's PlayerStats key>`, in the registry's order (the game
 * nav's).
 */
export const GAME_PAGES: GameLayout[] = [
  ARCADE_PAGE,
  BEDWARS_PAGE,
  BLITZSG_PAGE,
  BUILD_BATTLE_PAGE,
  CHALLENGES_PAGE,
  DUELS_PAGE,
  PAINTBALL_PAGE,
  PARKOUR_PAGE,
  PIT_PAGE,
  QUAKE_PAGE,
  TURBO_KART_RACERS_PAGE,
  UHC_PAGE,
  WALLS_PAGE,
].toSorted((a, b) => registryIndex(a) - registryIndex(b));

export const findGamePage = (segment: string): GameLayout | undefined =>
  GAME_PAGES.find((layout) => layout.game.key === segment);

/** The URL segment of a game's page, when the site has one. */
export const gamePageOf = (id: GameId): string | undefined => GAME_PAGES.find((layout) => layout.game.id === id)?.game.key;

/** The submodes a page's mode offers, or none; the first is the default. */
export const pageSubmodes = (layout: GameLayout, mode: string): string[] | undefined =>
  pageModes(layout).find(({ key }) => key === mode)?.submodes?.map(({ key }) => key);

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  const { Player } = await import("@statsify/schemas");
  const { catalogPaths, playerFields } = await import("@statsify/catalog");
  const { GamePageSchema } = await import("@statsify/contract");
  const { readFile } = await import("node:fs/promises");
  const { buildGamePage, levelProgression, pagesOf, shownPaths } = await import("./layout.js");

  /** Every key in one of the en-US locale files, dotted. */
  const localeKeys = async (file: string) => {
    const keys = new Set<string>();
    const walk = (value: unknown, path: string[]): void => {
      if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) walk(item, [...path, key]);
      else keys.add(path.join("."));
    };
    walk(JSON.parse(await readFile(new URL(`../../../../../locales/en-US/${file}.json`, import.meta.url), "utf8")), []);
    return keys;
  };
  const [bot, site] = await Promise.all([localeKeys("default"), localeKeys("site")]);

  /** The locale keys a page sends that the site can't translate: the level's are the bot's words, the rest either file's. */
  const missingWords = (page: ReturnType<typeof buildGamePage>) => {
    const cells = [...page.overview, ...page.sections.flatMap(({ rows }) => rows.flat())];
    const words = [
      page.heading.word,
      ...page.sections.flatMap(({ title, rowTitles }) => [title, ...(rowTitles ?? [])]),
      // A cell with the card's own name never shows its label.
      ...cells.flatMap(({ label, short, name }) => [name === undefined ? label : null, short]),
    ].filter((key): key is string => typeof key === "string");
    const level = page.level ? [page.level.label, page.level.progress] : [];
    return [...words.filter((key) => !bot.has(key) && !site.has(key)), ...level.filter((key) => !bot.has(key))];
  };

  describe("game pages", () => {
    it("shows a level past its max, or with no max, as maxed, and keeps its bar within 0 to 1", () => {
      expect(levelProgression({ current: 942, max: 500, percent: 1.88 })).toEqual({ current: 942, percent: 1 });
      expect(levelProgression({ current: 5, max: 0, percent: 0 })).toEqual({ current: 5, percent: 1 });
      expect(levelProgression({ current: 5, percent: 0.5 })).toEqual({ current: 5, percent: 1 });
      expect(levelProgression({ current: Number.NaN, max: 10, percent: Number.NaN })).toEqual({ current: 0, max: 10, percent: 0 });
    });

    it("marks no mode when nothing was played, the first of a tie, and a mode by where it's stored", () => {
      const player = new Player({ uuid: "0", displayname: "test" });
      const marked = () => buildGamePage(player, DUELS_PAGE, "overall").modes.find(({ mostPlayed }) => mostPlayed);
      expect(marked()).toBeUndefined();
      player.stats.duels.sumo.wins = 3;
      player.stats.duels.bow.losses = 3;
      expect(marked()).toMatchObject({ key: "bow", mostPlayed: "winsLosses" });
      // Bridge is weighed at `bridge.overall`, and Spleef, which has no Overall, by its two submodes added up.
      player.stats.duels.bridge.overall.wins = 4;
      expect(marked()?.key).toBe("bridge");
      player.stats.duels.spleef.spleef.wins = 3;
      player.stats.duels.spleef.bowSpleef.losses = 2;
      expect(marked()?.key).toBe("spleef");
    });

    for (const layout of GAME_PAGES) {
      it(`${layout.game.key}: every page builds from the catalog, for a player who never played`, () => {
        const player = new Player({ uuid: "0", displayname: "test" });
        expect(() => shownPaths(layout)).not.toThrow();
        for (const { mode, submode } of pagesOf(layout)) {
          const page = buildGamePage(player, layout, mode, submode);
          // The API checks its output against the contract, so a page the contract rejects would be an error page.
          expect(() => GamePageSchema.parse({ ...page, games: [] }), mode).not.toThrow();
          expect(missingWords(page), `${mode} ${submode ?? ""}`).toEqual([]);
        }
      });

      // Every stat with a leaderboard is on a page, or left off with a reason (and then really left off). Hidden boards
      // are reached through the level, and a field without a board only where the card shows it.
      it(`${layout.game.key}: shows every stat with a leaderboard, except those it omits`, () => {
        const shown = shownPaths(layout);
        const omitted = Object.keys(layout.omit ?? {}).map((path) => `stats.${layout.game.key}.${path}`);
        const paths = catalogPaths(layout.game);
        const ranked = paths.filter((path) => {
          const { leaderboard } = playerFields().get(path)!;
          return leaderboard.enabled && !leaderboard.hidden;
        });

        expect(ranked.filter((path) => !shown.has(path) && !omitted.includes(path))).toEqual([]);
        expect(omitted.filter((path) => shown.has(path) || !paths.includes(path))).toEqual([]);
      });
    }
  });
}
