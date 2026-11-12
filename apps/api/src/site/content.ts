/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BRACKET_MAP,
  PRESTIGE_SCHEMES,
  PRESTIGE_STARS,
  RATIO_STATS,
  STAR_MAP,
  getBedWarsExpReq,
  getIntendedFormattedLevel,
} from "@statsify/schemas";
import { catalogStats } from "./leaderboards.js";
import { findScore, prettify } from "@statsify/util";
import type { Glossary, GlossaryEntry, LeaderboardGroup, PrestigeSheet } from "@statsify/contract";
import type { Stat } from "@statsify/catalog";

/** Named first in an entry's games, as the site's game list does; the rest go by how many leaderboards rank the stat. */
const FIRST_GAMES = ["bedwars", "skywars", "duels"];

/** A label whose words take a value: Pit's "Tier {{tier}}" covers its three tiers. */
const LABEL_PARAMS: Record<string, Record<string, string>> = { "stats.tier": { tier: "I–III" } };

const RATIOS = new Map(
  RATIO_STATS.map(([numerator, denominator, key, , multiplier = 1]) => [key, { numerator, denominator, multiplier }])
);

const RATIO_ORDER = [...RATIOS.keys()];

/**
 * Every stat the site shows under a label, one entry for each `glossary.*` key: the ratios first, then the stats two or
 * more games show, then each game's own. A stat shown under its card's name (a map, a challenge) is a name, not a stat
 * to explain. Built from the catalog and the leaderboard list's game names; the words are in the locale files.
 */
export function buildGlossary(groups: LeaderboardGroup[]): Glossary {
  const shown = [...catalogStats().values()].filter((stat) => stat.name === undefined);
  const names = new Map(groups.map(({ key, name }) => [key, name]));
  const games = Object.fromEntries(
    [...new Set(shown.map(gameOf))].map((game) => [game, names.get(game) ?? prettify(game)])
  );
  const built = [...Map.groupBy(shown, (stat) => stat.glossary)].map(([key, stats]) => {
    const ratio = ratioOf(stats);
    return { entry: entry(key, stats, games, ratio), ratio };
  });

  const ratios = built
    .filter(({ ratio }) => ratio)
    .toSorted((a, b) => RATIO_ORDER.indexOf(a.ratio!) - RATIO_ORDER.indexOf(b.ratio!))
    .map(({ entry }) => entry);
  const rest = built.filter(({ ratio }) => !ratio).map(({ entry }) => entry);
  const shared = rest.filter(({ games }) => games.length > 1).toSorted((a, b) => b.games.length - a.games.length);
  const own = Map.groupBy(
    rest.filter(({ games }) => games.length === 1),
    ({ games }) => games[0].key
  );

  return {
    games,
    groups: [
      { key: "ratios", entries: ratios },
      { key: "shared", entries: shared },
      ...[...own].map(([key, entries]) => ({ key, entries })).toSorted((a, b) => games[a.key].localeCompare(games[b.key])),
    ],
  };
}

/** The `PlayerStats` key a stat is stored under. */
const gameOf = (stat: Stat) => stat.path.split(".")[1];

/** The ratio a stat is, by its key's last part (`overall.kdr` is `kdr`). */
const ratioOf = (stats: Stat[]) => stats.map(({ key }) => key.slice(key.lastIndexOf(".") + 1)).find((key) => RATIOS.has(key));

const ranked = (stat: Stat) => Boolean(stat.leaderboard && !stat.leaderboard.hidden);

const gameOrder = (game: string) => (FIRST_GAMES.includes(game) ? FIRST_GAMES.indexOf(game) : FIRST_GAMES.length);

function entry(key: string, stats: Stat[], games: Record<string, string>, ratio: string | undefined): GlossaryEntry {
  const [{ label }] = stats;
  const boards = new Map<string, number>();

  for (const stat of stats) {
    const game = gameOf(stat);
    boards.set(game, (boards.get(game) ?? 0) + (ranked(stat) ? 1 : 0));
  }

  const boarded = stats.filter(ranked);

  return {
    key,
    label,
    ...(LABEL_PARAMS[label] && { params: LABEL_PARAMS[label] }),
    color: stats.map(({ color }) => color).find((color) => typeof color === "string") ?? null,
    games: [...boards]
      .map(([game, count]) => ({ key: game, boards: count }))
      .toSorted((a, b) => gameOrder(a.key) - gameOrder(b.key) || b.boards - a.boards || games[a.key].localeCompare(games[b.key])),
    board: boarded.length === 1 ? boarded[0].path : null,
    formula: formula(stats, ratio),
  };
}

/** A ratio's parts, labeled as the stats beside it are (Turbo Kart Racers' Gold is its gold trophies). */
function formula(stats: Stat[], ratio: string | undefined): GlossaryEntry["formula"] {
  if (!ratio) return null;

  const { numerator, denominator, multiplier } = RATIOS.get(ratio)!;
  const stat = stats.find(({ key }) => key.endsWith(ratio))!;
  const beside = (part: string) => catalogStats().get(stat.path.replace(/[^.]+$/, part))?.label ?? `stats.${part}`;

  return { numerator: beside(numerator), denominator: beside(denominator), multiplier };
}

/** Prestige names where the scheme's key, prettified, isn't the game's name for it. */
const PRESTIGE_NAMES: Record<string, string> = { none: "Stone", x_ray: "X-Ray" };

/** A prestige is 100 levels. */
const PRESTIGE_LEVELS = 100;

/**
 * Every BedWars prestige the game colors, from the schemas' scheme map (the cards' level colors), each at its first
 * level with the star it shows and the EXP it takes; and the stars and brackets Hypixel sells.
 */
export function buildPrestigeSheet(): PrestigeSheet {
  const levelExp = Array.from({ length: PRESTIGE_LEVELS }, (_, level) => getBedWarsExpReq(level));
  // The API doesn't depend on `@statsify/math`, so no `add` here.
  const prestigeExp = levelExp.reduce((sum, exp) => sum + exp, 0);
  // The first levels, up to the first that takes as much as every level after it.
  const steady = levelExp.indexOf(levelExp.at(-1)!);

  return {
    prestiges: PRESTIGE_SCHEMES.map(({ req, scheme }) => ({
      level: req,
      name: PRESTIGE_NAMES[scheme] ?? prettify(scheme),
      formatted: getIntendedFormattedLevel(req),
      star: STAR_MAP[findScore(PRESTIGE_STARS, req).star],
      exp: (req / PRESTIGE_LEVELS) * prestigeExp,
    })),
    levelExp: levelExp.slice(0, steady + 1),
    stars: Object.entries(STAR_MAP).map(([key, glyph]) => ({ key, name: prettify(key), glyph })),
    brackets: Object.entries(BRACKET_MAP).map(([key, [open, close]]) => ({ key, name: prettify(key), open, close })),
  };
}
