/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ColorCode, GAMES, type Game, cardColors, statAt } from "@statsify/catalog";
import { FormattedGame, type GameId, type Player, type PlayerStats, getNetworkExp } from "@statsify/schemas";
import type { GamePage, GameSummary, PlayerPage, StatRow } from "@statsify/contract";
import { findScore, formatTime } from "@statsify/util";
import { freshness } from "./cooldown.js";
import { gameName } from "./names.js";
import { winstreaksHidden } from "./game-pages/duels.js";
import { GAME_PAGES, gamePageOf, pageName } from "./game-pages/index.js";
import { read } from "./game-pages/layout.js";

/**
 * Hypixel's network-level coin multiplier from each first level, ascending.
 *
 * Source: the Hypixel wiki's "Coin Multipliers" table (Level → Coin Multiplier) as captured on
 * 2026-10-19. It ends at level 250 and lists levels only, so this is the level multiplier; whether
 * a rank raises it is not covered.
 */
const LEVEL_MULTIPLIERS = [
  { req: 0, multiplier: 1 },
  { req: 5, multiplier: 1.5 },
  { req: 10, multiplier: 2 },
  { req: 15, multiplier: 2.5 },
  { req: 20, multiplier: 3 },
  { req: 25, multiplier: 3.5 },
  { req: 30, multiplier: 4 },
  { req: 40, multiplier: 4.5 },
  { req: 50, multiplier: 5 },
  { req: 100, multiplier: 5.5 },
  { req: 125, multiplier: 6 },
  { req: 150, multiplier: 6.5 },
  { req: 200, multiplier: 7 },
  { req: 250, multiplier: 8 },
];

/** The guild fields the page reads, deserialized: its name and tag plus each member's quest and GEXP rows. */
export interface PlayerGuild {
  id: string;
  name: string;
  tag?: string;
  tagFormatted?: string;
  members: { uuid: string; questParticipation: number; daily: number; weekly: number }[];
}

type Value = (stats: PlayerStats) => number | string | undefined;

/**
 * A panel row: a catalog stat by its key, stored below the summary's `at` unless the row says where (`""` for a game
 * stat), in the catalog's color and unit and linked to its leaderboard, under `stats.<label>` (its key by default).
 * `value` is the panel's own text for it (a time, Layers out of 100), nothing leaving the row out; `hidden` says when
 * the player hides it from Hypixel's API (winstreaks), which the row then says instead of linking. `name` is a
 * formatted title shown in place of the label, and `color` replaces the catalog's (Parkour's Main Lobby).
 */
type RowSpec =
  | string
  | {
    key: string;
    at?: string;
    label?: string;
    name?: string;
    color?: ColorCode;
    value?: Value;
    hidden?: (stats: PlayerStats) => boolean;
  };

/** A row the panel works out from other stats, in its own color, with no leaderboard. */
interface ComputedRow {
  label: string;
  color: ColorCode;
  compute: Value;
}

const isComputed = (row: RowSpec | ComputedRow): row is ComputedRow => typeof row !== "string" && "compute" in row;

interface Summary {
  id: GameId;
  /** Minecraft-formatted level or prefix for the panel title. */
  level?: (stats: PlayerStats) => string | undefined;
  /** Where the rows' stats are stored below the game: a mode (`overall`), or the game itself by default. */
  at?: string;
  /** Four rows, so the panel's two columns come out even. */
  rows: (RowSpec | ComputedRow)[];
}

/** A duration as the panel's text (it formats only numbers); nothing for one never set. */
const time = (ms: number | undefined) => (ms ? formatTime(ms) : undefined);

/** The player's best time on each lobby course they have finished. */
const courseTimes = ({ parkour }: PlayerStats) =>
  Object.values(parkour).filter((ms): ms is number => typeof ms === "number" && ms > 0);

/**
 * What each game panel shows: four headline numbers from the overall mode, picked by hand. A game without overall
 * kills (Arcade, TNT Games) fills the rest from one or two of its modes.
 */
const GAME_SUMMARIES: Summary[] = [
  {
    id: "BEDWARS",
    level: (s) => s.bedwars.levelFormatted,
    at: "overall",
    rows: ["wins", "finalKills", "fkdr", "bedsBroken"],
  },
  {
    id: "SKYWARS",
    level: (s) => s.skywars.levelFormatted,
    at: "overall",
    rows: ["wins", "kills", "kdr", "wlr"],
  },
  {
    id: "DUELS",
    at: "overall",
    rows: ["wins", "kills", "wlr", { key: "bestWinstreak", hidden: winstreaksHidden }],
  },
  {
    id: "ARCADE",
    rows: ["wins", "coins", "coinConversions", { key: "wins", at: "zombies.overall", label: "zombiesWins" }],
  },
  {
    id: "ARENA_BRAWL",
    level: (s) => s.arenabrawl.naturalPrefix,
    at: "overall",
    rows: ["wins", "kills", "kdr", "wlr"],
  },
  {
    id: "BLITZSG",
    level: (s) => s.blitzsg.naturalPrefix,
    at: "overall",
    rows: ["wins", "kills", "kdr", { key: "coins", at: "" }],
  },
  {
    id: "BUILD_BATTLE",
    level: (s) => s.buildbattle.titleFormatted,
    rows: [{ key: "overall.wins", label: "wins" }, "score", "correctGuesses", "votes"],
  },
  {
    id: "COPS_AND_CRIMS",
    level: (s) => s.copsandcrims.levelFormatted,
    at: "overall",
    rows: ["wins", "kills", "kdr", "headshotKills"],
  },
  {
    id: "MEGAWALLS",
    at: "overall",
    rows: ["wins", "finalKills", "fkdr", "witherKills"],
  },
  {
    id: "MURDER_MYSTERY",
    at: "overall",
    rows: ["wins", "kills", "murdererWins", "detectiveWins"],
  },
  {
    id: "PAINTBALL",
    level: (s) => s.paintball.naturalPrefix,
    rows: ["wins", "kills", "kdr", "shotAccuracy"],
  },
  {
    id: "PIT",
    level: (s) => s.pit.levelFormatted,
    rows: ["kills", "deaths", "kdr", "gold"],
  },
  {
    id: "PARKOUR",
    // Best Time pink, as Duels Parkour's and Arcade's best times; Main Lobby under its game's name, in its first color.
    rows: [
      { label: "coursesCompleted", color: "§a", compute: (s) => courseTimes(s).length },
      { label: "bestTime", color: "§d", compute: (s) => time(courseTimes(s).toSorted((a, b) => a - b)[0]) },
      { key: "MAIN_LOBBY", label: "mainLobby", name: FormattedGame.MAIN_LOBBY, color: "§3", value: (s) => time(s.parkour.MAIN_LOBBY) },
      { label: "combinedTime", color: "§e", compute: (s) => time(courseTimes(s).reduce((sum, ms) => sum + ms, 0)) },
    ],
  },
  {
    id: "QUAKE",
    level: (s) => s.quake.naturalPrefix,
    at: "overall",
    rows: ["wins", "kills", "kdr", "headshots"],
  },
  {
    id: "SMASH_HEROES",
    level: (s) => s.smashheroes.levelFormatted,
    at: "overall",
    rows: ["wins", "kills", "kdr", "wlr"],
  },
  {
    id: "SPEED_UHC",
    level: (s) => s.speeduhc.levelFormatted,
    at: "overall",
    rows: ["wins", "kills", "kdr", "wlr"],
  },
  {
    id: "TNT_GAMES",
    rows: [
      "wins",
      "coins",
      { key: "wins", at: "tntRun", label: "tntRunWins" },
      { key: "kills", at: "wizards", label: "wizardsKills" },
    ],
  },
  {
    id: "TURBO_KART_RACERS",
    rows: [
      { key: "gold", label: "goldTrophies" },
      { key: "silver", label: "silverTrophies" },
      { key: "bronze", label: "bronzeTrophies" },
      "lapsCompleted",
    ],
  },
  {
    id: "UHC",
    level: (s) => s.uhc.levelFormatted,
    at: "overall",
    rows: ["wins", "kills", "kdr", "headsEaten"],
  },
  {
    id: "VAMPIREZ",
    rows: ["overallWins", "zombieKills", "mostVampireKills", "coins"],
  },
  {
    id: "WALLS",
    level: (s) => s.walls.naturalPrefix,
    rows: ["wins", "kills", "kdr", "wlr"],
  },
  {
    id: "WARLORDS",
    level: (s) => s.warlords.titleFormatted,
    rows: ["wins", "kills", "kdr", "wlr"],
  },
  {
    id: "WOOLGAMES",
    level: (s) => s.woolgames.levelFormatted,
    rows: [
      "wins",
      // Out of 100, as the card prints it.
      { key: "layers", value: (s) => `§a${s.woolgames.layers}§8/§a100` },
      { key: "coins", label: "wool" },
      { key: "playtime", value: (s) => time(s.woolgames.playtime) },
    ],
  },
];

/** A game's entry in the catalog, which every game with a panel has. */
function catalogGame(id: GameId): Game {
  const game = Object.values(GAMES).find((entry) => entry.id === id);
  if (!game) throw new Error(`The catalog has no ${id}`);
  return game;
}

/** A panel row, or nothing for one the panel leaves out (a time never set). */
function panelRow(stats: PlayerStats, game: Game, at: string, row: RowSpec | ComputedRow): StatRow | undefined {
  if (isComputed(row)) {
    const value = row.compute(stats);
    return value === undefined ? undefined : { key: row.label, value, color: row.color, leaderboard: null };
  }

  const spec: Exclude<RowSpec, string> = typeof row === "string" ? { key: row } : row;
  const place = spec.at ?? at;
  const stat = statAt(game, place, spec.key);
  const hidden = spec.hidden?.(stats) ?? false;
  const value = spec.value ? spec.value(stats) : Number(read({ stats }, stat.path));
  if (value === undefined) return undefined;

  return {
    key: spec.label ?? spec.key,
    ...(spec.name && { name: spec.name }),
    value,
    ...(hidden && { hidden }),
    ...(stat.suffix && !hidden && { suffix: stat.suffix }),
    color: spec.color ?? cardColors(game, ...(place ? [place] : []))(spec.key),
    leaderboard: stat.leaderboard && !hidden ? stat.path : null,
  };
}

/** A game panel, or `undefined` for a game the player has never played, which the page leaves out. */
function summarize(stats: PlayerStats, summary: Summary): GameSummary | undefined {
  const game = catalogGame(summary.id);
  const rows = summary.rows.flatMap((row) => panelRow(stats, game, summary.at ?? "", row) ?? []);

  // Ratios and formatted levels follow from the counts, so all-zero counts mean there is nothing to show.
  const played = rows.some((row) => typeof row.value === "number" && row.value > 0);
  if (!played) return undefined;

  return { id: summary.id, name: gameName(summary.id), level: summary.level?.(stats), rows, page: gamePageOf(summary.id) };
}

/** The site's game pages for the nav between them, each marked when the player has never played the game. */
export function gameNav(stats: PlayerStats): GamePage["games"] {
  return GAME_PAGES.map((layout) => {
    const { key, id } = layout.game;
    if (layout.played) return { key, id, name: pageName(layout), played: layout.played(stats) };
    const summary = GAME_SUMMARIES.find((entry) => entry.id === id);
    if (!summary) throw new Error(`${key} has no player-page panel`);
    return { key, id, name: pageName(layout), played: summarize(stats, summary) !== undefined };
  });
}

/** The `player.page` view model from a deserialized player and their guild. */
export function buildPlayerPage(player: Player, guild: PlayerGuild | null): PlayerPage {
  const { general, quests, challenges } = player.stats;
  const { status, socials } = player;
  const lastGame = status.lastGame?.id;

  const level = general.networkLevel;
  const levelStart = getNetworkExp(Math.floor(level));
  const levelEnd = getNetworkExp(Math.floor(level) + 1);
  const current = Math.max(0, Math.round(general.networkExp - levelStart));
  const max = Math.round(levelEnd - levelStart);

  const member = guild?.members.find((m) => m.uuid === player.uuid);

  return {
    uuid: player.uuid,
    username: player.username,
    displayName: player.displayName,
    prefixName: player.prefixName,
    rank: player.rank,
    guild: guild ?
      {
        id: guild.id,
        name: guild.name,
        tag: guild.tag || undefined,
        tagFormatted: guild.tagFormatted || undefined,
      } :
      null,
    overview: {
      achievementPoints: general.achievementPoints,
      karma: general.karma,
      quests: quests.total,
      challenges: challenges.total,
      giftsSent: general.giftsSent,
      ranksGifted: general.ranksGifted,
      currentRewardStreak: general.currentRewardStreak,
      highestRewardStreak: general.highestRewardStreak,
      guildMember: member ?
        { questParticipation: member.questParticipation, daily: member.daily, weekly: member.weekly } :
        null,
    },
    level: {
      level,
      exp: general.networkExp,
      current,
      max,
      percent: max > 0 ? Math.min(1, current / max) : 1,
      multiplier: findScore(LEVEL_MULTIPLIERS, Math.floor(level)).multiplier,
    },
    status: {
      online: status.online,
      statusHidden: status.statusHidden,
      firstLogin: status.firstLogin,
      lastLogin: status.lastLogin,
      lastLogout: status.lastLogout,
      lastGame: lastGame ? { id: lastGame, name: gameName(lastGame) } : null,
    },
    socials: {
      discord: socials.discord,
      forums: socials.forums,
      instagram: socials.instagram,
      tiktok: socials.tiktok,
      twitch: socials.twitch,
      twitter: socials.twitter,
      youtube: socials.youtube,
    },
    games: GAME_SUMMARIES.flatMap((summary) => summarize(player.stats, summary) ?? []),
    ...freshness(player),
  };
}
