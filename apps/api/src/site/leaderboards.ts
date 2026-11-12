/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameId, Player, getLeaderboardFields } from "@statsify/schemas";
import { GAMES, type Stat, allStats, modeName } from "@statsify/catalog";
import { gameName, siteName } from "./names.js";
import { removeFormatting } from "@statsify/util";
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
 * One game's leaderboards by mode. A leaderboard below a mode in the game's registry (`stats.bedwars.solo.wins`) is
 * that mode's, and the rest (`stats.bedwars.tokens`) are the game's own, which come first; modes keep the registry's
 * order. Quests keep each game's below the period (`stats.quests.overall.ARCADE.total`), so there the game below an
 * `overall` is the mode. A name loses the game and mode it's listed under: "BedWars Solo Wins" is Wins under Solo, and
 * "Arcade Challenges - Farm Hunt" is Farm Hunt under Challenges' Arcade.
 */
export function leaderboardGame({ leaderboards, ...group }: LeaderboardGroup): LeaderboardGame {
  const game = GAMES[group.key];
  const modes = new Map<string, LeaderboardGame["modes"][number]>([["", { key: "", name: null, leaderboards: [] }]]);

  for (const { api } of game?.modes.getModes() ?? []) {
    modes.set(api, { key: api, name: removeFormatting(siteName(modeName(game, api))), leaderboards: [] });
  }

  for (const { api, name } of DATED_GROUPS[group.key] ?? []) modes.set(api, { key: api, name, leaderboards: [] });

  const groupName = removeFormatting(group.formatted);

  for (const { field, name } of leaderboards) {
    const mode = modes.get(modeKey(field, (key) => modes.has(key)))!;
    const short = withoutPrefix(withoutPrefix(withoutPrefix(name, groupName), mode.name ?? ""), groupName);
    mode.leaderboards.push({ field, name: short });
  }

  for (const { api } of DATED_GROUPS[group.key] ?? []) modes.get(api)!.leaderboards.reverse();

  return { ...group, modes: [...modes.values()].filter((mode) => mode.leaderboards.length > 0) };
}

/**
 * Groups a game's index lists beyond its mode registry, each of dated boards: General's seasonal events
 * (`stats.general.events.*`). They're listed newest first, as the schema adds each event after the last.
 */
const DATED_GROUPS: Record<string, { api: string; name: string }[]> = {
  general: [{ api: "events", name: "Events" }],
};

/** The key of the mode `field` is listed under in its game's index, as `leaderboardGame` places it; "" is the game's own. */
function modeKey(field: string, isMode: (key: string) => boolean): string {
  const [first, second] = field.split(".").slice(2, -1);
  const key = first === "overall" && second && isMode(second) ? second : first;
  return key && isMode(key) ? key : "";
}

/** Where a board is listed: its game's index (`/leaderboards/<key>`) and the mode it's under there. */
export function leaderboardIndex(field: string): { key: string; mode: string } | undefined {
  const [root, key] = field.split(".");
  if (root !== "stats" || !key) return;
  const modes = new Set([...(GAMES[key]?.modes.getModes() ?? []), ...(DATED_GROUPS[key] ?? [])].map(({ api }) => api));
  return { key, mode: modeKey(field, (mode) => modes.has(mode)) };
}

type GroupNames = Pick<LeaderboardGroup, "game" | "formatted">;

const gameGroup = (game: GameId): GroupNames => ({ game, formatted: gameName(game) });

/** A group that isn't a game's, so it has no colors. */
const otherGroup = (name: string): GroupNames => ({ game: null, formatted: name });

/** `PlayerStats` keys → the leaderboard group they belong to. */
export const LEADERBOARD_GROUPS: Record<string, GroupNames> = {
  arcade: gameGroup("ARCADE"),
  arenabrawl: gameGroup("ARENA_BRAWL"),
  bedwars: gameGroup("BEDWARS"),
  blitzsg: gameGroup("BLITZSG"),
  buildbattle: gameGroup("BUILD_BATTLE"),
  challenges: otherGroup("Challenges"),
  copsandcrims: gameGroup("COPS_AND_CRIMS"),
  duels: gameGroup("DUELS"),
  general: gameGroup("GENERAL"),
  megawalls: gameGroup("MEGAWALLS"),
  murdermystery: gameGroup("MURDER_MYSTERY"),
  paintball: gameGroup("PAINTBALL"),
  parkour: gameGroup("PARKOUR"),
  pit: gameGroup("PIT"),
  quake: gameGroup("QUAKE"),
  quests: otherGroup("Quests"),
  skywars: gameGroup("SKYWARS"),
  smashheroes: gameGroup("SMASH_HEROES"),
  speeduhc: gameGroup("SPEED_UHC"),
  tntgames: gameGroup("TNT_GAMES"),
  turbokartracers: gameGroup("TURBO_KART_RACERS"),
  uhc: gameGroup("UHC"),
  vampirez: gameGroup("VAMPIREZ"),
  walls: gameGroup("WALLS"),
  warlords: gameGroup("WARLORDS"),
  woolgames: gameGroup("WOOLGAMES"),
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
