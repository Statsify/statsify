/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GAMES, type Stat, gameStats, modeName, modeStats } from "@statsify/catalog";
import { Player, getLeaderboardNames } from "@statsify/schemas";
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

/** A board's name from the levels of its path below `level`, the one it's listed under, and that level's name. */
function nameBelow(field: string, level: number, levelName: string | null): string {
  const names = getLeaderboardNames(Player, field);
  const below = removeFormatting(names.slice(level + 1).filter(Boolean).join(" "));
  // Duels leave BedWars and Spleef unnamed so Bed Rush and Bow Spleef don't repeat them, and name the levels below
  // for them instead ("BedWars Overall").
  return !names[level] && levelName && below.startsWith(`${levelName} `) ? below.slice(levelName.length + 1) : below;
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

  for (const { field } of leaderboards) {
    const mode = modes.get(modeKey(field, (key) => modes.has(key)))!;
    const level = mode.key ? field.split(".").indexOf(mode.key, 2) : 1;
    mode.leaderboards.push({ field, name: nameBelow(field, level, mode.name) });
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
