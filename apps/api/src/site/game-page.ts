/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS, type Game, type Stat, gameStats, modeStats, statModes } from "@statsify/catalog";
import { FormattedGame, type GameId, type Player, type PlayerStats } from "@statsify/schemas";
import { PLAYER_COOLDOWN_MS } from "./cooldown.js";
import type { GamePage, StatCell } from "@statsify/contract";

/** A stat in a section, by catalog key; one with `when` shows only when `when` allows its cell. */
type SectionKey = string | { key: string; when: (cell: StatCell) => boolean };

const keyOf = (entry: SectionKey) => (typeof entry === "string" ? entry : entry.key);

/**
 * The site's page for one game: which of the catalog's stats it shows, in what groups and order. The bot's card for the
 * game has its own layout; both take labels, colours and leaderboards from the catalog.
 */
export interface GameLayout {
  game: Game;
  /** The level header, for a game with levels: the catalog key of the stat its leaderboard ranks, and the level. */
  level?: { key: string; read: (stats: PlayerStats) => Omit<NonNullable<GamePage["level"]>, "leaderboard"> };
  /** Game-wide stats by catalog key, each shown when `when` allows. */
  overview: { key: string; when?: (stats: PlayerStats) => boolean }[];
  /** The mode's stats in groups: a `game.sections.*` title (null for the headline table) and catalog keys in order. */
  sections: { title: string | null; keys: SectionKey[] }[];
}

// Slumber tickets show once the player has a wallet, as on the bot's card.
const hasWallet = ({ bedwars }: PlayerStats) => bedwars.slumber.wallet > 0;

const BEDWARS_PAGE: GameLayout = {
  game: BEDWARS,
  level: {
    key: "exp",
    read: ({ bedwars }) => ({
      current: bedwars.levelFormatted,
      natural: bedwars.naturalLevelFormatted,
      next: bedwars.nextLevelFormatted,
      progression: { ...bedwars.progression },
    }),
  },
  overview: [{ key: "tokens" }, { key: "slumber.tickets", when: hasWallet }, { key: "slumber.totalTickets", when: hasWallet }],
  sections: [
    // The card's table: rows of a count, its opposite and their ratio.
    {
      title: null,
      keys: ["wins", "losses", "wlr", "finalKills", "finalDeaths", "fkdr", "kills", "deaths", "kdr", "bedsBroken", "bedsLost", "bblr"],
    },
    {
      title: "game.sections.resources",
      keys: ["itemsCollected.iron", "itemsCollected.gold", "itemsCollected.diamond", "itemsCollected.emerald"],
    },
    // As on the card, winstreak shows only when it isn't 0: the Dreams modes don't track it and always store 0.
    { title: "game.sections.games", keys: ["gamesPlayed", { key: "winstreak", when: ({ value }) => value !== 0 }] },
  ],
};

/** The games the site has a page for; each page's URL segment is its game's `PlayerStats` key. */
export const GAME_PAGES: GameLayout[] = [BEDWARS_PAGE];

export const findGamePage = (segment: string): GameLayout | undefined =>
  GAME_PAGES.find((layout) => layout.game.key === segment);

/** The URL segment of a game's page, when the site has one. */
export const gamePageOf = (id: GameId): string | undefined => GAME_PAGES.find((layout) => layout.game.id === id)?.game.key;

/** The modes a game page offers; the first is its default. */
export const pageModes = (layout: GameLayout): string[] => statModes(layout.game).map(({ api }) => api);

const read = (player: Player, path: string): unknown =>
  path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], player);

const leaderboardOf = (stat: Stat) => (stat.leaderboard ? stat.path : null);

function cell(player: Player, stat: Stat): StatCell {
  const value = read(player, stat.path);

  return {
    key: stat.key,
    label: stat.label,
    value: stat.format ? stat.format(value) : Number(value ?? 0),
    ...(stat.of && { of: Number(read(player, stat.of) ?? 0) }),
    colour: stat.colour,
    leaderboard: leaderboardOf(stat),
  };
}

function find(stats: Stat[], key: string): Stat {
  const stat = stats.find((candidate) => candidate.key === key);
  if (!stat) throw new Error(`The catalog has no ${key}`);
  return stat;
}

/** The `player.game` view model: one mode of one game's page, from a deserialized player. */
export function buildGamePage(player: Player, layout: GameLayout, mode: string): GamePage {
  const { game } = layout;
  const overview = gameStats(game);
  const stats = modeStats(game, mode);

  return {
    uuid: player.uuid,
    username: player.username,
    displayName: player.displayName,
    game: { key: game.key, id: game.id, name: FormattedGame[game.id] },
    modes: statModes(game).map(({ api, formatted }) => ({ key: api, name: formatted })),
    mode,
    level: layout.level ?
      { ...layout.level.read(player.stats), leaderboard: leaderboardOf(find(overview, layout.level.key)) } :
      null,
    overview: layout.overview
      .filter(({ when }) => when?.(player.stats) ?? true)
      .map(({ key }) => cell(player, find(overview, key))),
    sections: layout.sections
      .map(({ title, keys }) => ({
        title,
        cells: keys.flatMap((entry) => {
          const stat = cell(player, find(stats, keyOf(entry)));
          return typeof entry === "string" || entry.when(stat) ? [stat] : [];
        }),
      }))
      .filter(({ cells }) => cells.length > 0),
    updatedAt: player.expiresAt - PLAYER_COOLDOWN_MS,
    expiresAt: player.expiresAt,
  };
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("game pages", () => {
    for (const layout of GAME_PAGES) {
      it(`${layout.game.key}: every key is in the catalog, in every mode`, () => {
        const overview = gameStats(layout.game);
        for (const { key } of layout.overview) expect(() => find(overview, key)).not.toThrow();
        const { level } = layout;
        if (level) expect(() => find(overview, level.key)).not.toThrow();

        for (const mode of pageModes(layout)) {
          const stats = modeStats(layout.game, mode);
          for (const { keys } of layout.sections) for (const key of keys) expect(() => find(stats, keyOf(key))).not.toThrow();
        }
      });
    }
  });
}
