/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GAMES, type Stat, gameStats, modeName, modeStats } from "@statsify/catalog";
import { removeFormatting } from "@statsify/util";
import type { LeaderboardColumn, LeaderboardGame, LeaderboardGroup } from "@statsify/contract";

let catalog: Map<string, Stat> | undefined;

/** Every stat the catalog describes, by its path. */
export function catalogStats(): Map<string, Stat> {
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
 * A leaderboard's value column, with the label and color the bot's cards give the stat. A stat the catalog doesn't
 * describe (some of General's) keeps the leaderboard's own name for the column.
 */
export function leaderboardColumn(field: string, name: string): LeaderboardColumn {
  const stat = catalogStats().get(field);
  return { field, name, label: stat?.label ?? null, color: typeof stat?.color === "string" ? stat.color : null };
}

/** The `stats.*` locale key the bot's cards label a stat with, where the catalog describes it. */
export const catalogLabel = (field: string): string | undefined => catalogStats().get(field)?.label;

/** The `glossary.*` key that explains a stat, where the glossary has it: not one shown under its card's name. */
export function catalogGlossary(field: string): string | null {
  const stat = catalogStats().get(field);
  return stat && stat.name === undefined ? stat.glossary : null;
}

/**
 * A name past a leading prefix and the " - " or space after it, the prefix matched ignoring case and spaces ("WoolWars"
 * is the mode "Wool Wars"), or the whole name where it doesn't start with the prefix or is nothing more.
 */
function withoutPrefix(name: string, prefix: string): string {
  const wanted = prefix.replaceAll(" ", "").toLowerCase();
  if (!wanted) return name;
  let at = 0;

  for (const char of wanted) {
    while (name[at] === " ") at++;
    if (name[at]?.toLowerCase() !== char) return name;
    at++;
  }

  return /^ ?-? (.+)$/.exec(name.slice(at))?.[1] ?? name;
}

/**
 * One game's leaderboards by mode, the game's own first, then the registry's modes in order. A name loses the game and
 * mode it's listed under: "BedWars Solo Wins" is Wins under Solo.
 */
export function leaderboardGame({ leaderboards, ...group }: LeaderboardGroup): LeaderboardGame {
  const game = GAMES[group.key];
  const modes = new Map<string, LeaderboardGame["modes"][number]>([["", { key: "", name: null, leaderboards: [] }]]);

  for (const { api } of game?.modes.getModes() ?? []) {
    modes.set(api, { key: api, name: removeFormatting(modeName(game, api)), leaderboards: [] });
  }

  for (const { field, name } of leaderboards) {
    const mode = modes.get(modeKey(field, (key) => modes.has(key)))!;
    const short = withoutPrefix(withoutPrefix(withoutPrefix(name, group.name), mode.name ?? ""), group.name);
    mode.leaderboards.push({ field, name: short });
  }

  return { ...group, modes: [...modes.values()].filter((mode) => mode.leaderboards.length > 0) };
}

/** The mode `field` is listed under in its game's index; "" is the game's own. */
function modeKey(field: string, isMode: (key: string) => boolean): string {
  // Quests keep each game's boards below the period (`stats.quests.overall.ARCADE.total`).
  const [first, second] = field.split(".").slice(2, -1);
  const key = first === "overall" && second && isMode(second) ? second : first;
  return key && isMode(key) ? key : "";
}

/** Where a board is listed: its game's index (`/leaderboards/<key>`) and the mode it's under there. */
export function leaderboardIndex(field: string): { key: string; mode: string } | undefined {
  const [root, key] = field.split(".");
  if (root !== "stats" || !key) return;
  const modes = new Set(GAMES[key]?.modes.getModes().map(({ api }) => api));
  return { key, mode: modeKey(field, (mode) => modes.has(mode)) };
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("withoutPrefix", () => {
    it("drops a leading prefix and the separator after it, ignoring case and spaces", () => {
      expect(withoutPrefix("BedWars Solo Wins", "BedWars")).toBe("Solo Wins");
      expect(withoutPrefix("Arcade Challenges - Farm Hunt", "Arcade Challenges")).toBe("Farm Hunt");
      expect(withoutPrefix("Wool Wars Kills", "WoolWars")).toBe("Kills");
      expect(withoutPrefix("BedWars", "BedWars")).toBe("BedWars");
      expect(withoutPrefix("Bed Wars", "BedWarsSolo")).toBe("Bed Wars");
    });
  });
}
