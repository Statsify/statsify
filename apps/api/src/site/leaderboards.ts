/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameId, Player, getLeaderboardFields, getLeaderboardNames } from "@statsify/schemas";
import { GAMES, type Stat, allStats, modeName } from "@statsify/catalog";
import { gameName, siteName } from "./names.js";
import { prettify, removeFormatting } from "@statsify/util";
import type { LeaderboardColumn, LeaderboardGame, LeaderboardGroup } from "@statsify/contract";

let catalog: Map<string, Stat> | undefined;

/** Every stat the catalog describes, by its path. */
export function catalogStats(): Map<string, Stat> {
  catalog ??= new Map(
    Object.values(GAMES)
      .flatMap((game) => allStats(game))
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
  return { field, name: siteName(name), label: stat?.label ?? null, color: typeof stat?.color === "string" ? stat.color : null };
}

/** The `stats.*` locale key the bot's cards label a stat with, where the catalog describes it. */
const catalogLabel = (field: string): string | undefined => catalogStats().get(field)?.label;

/** The `glossary.*` key that explains a stat, where the glossary has it: not one shown under its card's name. */
export const catalogGlossary = (field: string): string | null => catalogStats().get(field)?.glossary ?? null;

/** A board's name from the levels of its path below `level`, the one it's listed under, and that level's name. */
function nameBelow(field: string, level: number, levelName: string | null): string {
  const names = getLeaderboardNames(Player, field);
  const below = removeFormatting(siteName(names.slice(level + 1).filter(Boolean).join(" ")));
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
    modes.set(api, { key: api, name: removeFormatting(siteName(modeName(game, api))), leaderboards: [] });
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

type GroupNames = Pick<LeaderboardGroup, "game" | "formatted">;

const gameGroup = (game: GameId): GroupNames => ({ game, formatted: gameName(game) });

/** A group that isn't a game's, so it has no colors. */
const otherGroup = (name: string): GroupNames => ({ game: null, formatted: name });

/** `PlayerStats` keys → the leaderboard group they belong to: each catalog game's, and General's. */
export const LEADERBOARD_GROUPS: Record<string, GroupNames> = {
  general: gameGroup("GENERAL"),
  ...Object.fromEntries(Object.values(GAMES).map(({ key, id }) => [key, id ? gameGroup(id) : otherGroup(prettify(key))])),
};

/** Every enabled player leaderboard, grouped by the `stats.<game>` it lives under. Static metadata. */
export function buildLeaderboardGroups(): LeaderboardGroup[] {
  const groups = new Map<string, LeaderboardGroup>();

  for (const [field, { leaderboard }] of getLeaderboardFields(Player)) {
    const [root, statsKey] = field.split(".");
    if (root !== "stats" || !statsKey) continue;

    let group = groups.get(statsKey);

    if (!group) {
      group = { key: statsKey, ...(LEADERBOARD_GROUPS[statsKey] ?? otherGroup(statsKey)), leaderboards: [] };
      groups.set(statsKey, group);
    }

    const label = catalogLabel(field);
    group.leaderboards.push({
      field,
      name: removeFormatting(siteName(leaderboard.name)),
      ...(label && { label }),
      ...(leaderboard.enabled && leaderboard.aliases.length > 0 && { aliases: leaderboard.aliases }),
    });
  }

  return [...groups.values()];
}
