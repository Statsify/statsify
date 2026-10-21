/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { GamePage, LeaderboardPage, PlayerPage, ResultCard, StatCell, StatSection } from "@statsify/contract";

// The local run's two fixture players, so skins and the signature image resolve against a seeded API.
export const ANRIE_UUID = "3abe2f6bd45a4e2282d4f9014569db25";
export const OJAKEY_UUID = "41825ee5f46b406b9bb74aea7eb2742b";

/** Every name the stress test asks for: the longest name, guild tag and nine-digit numbers. */
const LONG_NAME = "WWWWWWWWWWWWWWWW";

export const SUGGESTIONS = ["anrie", "anrieTheSecond", "Andromeda", "AnnaBanana", "annoyingorange", "Antlers"];

export const RESULT_CARDS: ResultCard[] = [
  {
    uuid: ANRIE_UUID,
    username: "anrie",
    displayName: "§b[MVP§c+§b] anrie",
    rank: "MVP+",
    guildTag: "§6[STAT]",
    achievementPoints: 11_874,
    quests: 2_164,
    karma: 58_335_210,
  },
  {
    uuid: OJAKEY_UUID,
    username: LONG_NAME,
    displayName: `§6[MVP§2++§6] ${LONG_NAME}`,
    rank: "MVP++",
    guildTag: null,
    achievementPoints: 999_999_999,
    quests: 0,
    karma: 123_456_789,
  },
];

const NOW = Date.now();

export const PLAYER_PAGE: PlayerPage = {
  uuid: ANRIE_UUID,
  username: "anrie",
  displayName: "§b[MVP§c+§b] anrie",
  prefixName: "§b[MVP§c+§b] anrie",
  rank: "MVP+",
  guild: { id: "5e1f5e5e8ea8c9b6d2a0c0de", name: "Statsify", tag: "STAT", tagFormatted: "§6[STAT]" },
  overview: {
    achievementPoints: 11_874,
    karma: 58_335_210,
    quests: 2_164,
    challenges: 1_022,
    giftsSent: 43,
    ranksGifted: 12,
    currentRewardStreak: 3,
    highestRewardStreak: 211,
    guildMember: { questParticipation: 50, daily: 25_000, weekly: 154_000 },
  },
  level: { level: 247.62, exp: 112_000_000, current: 1_520_000, max: 2_450_000, percent: 0.62, multiplier: 7.5 },
  status: {
    online: false,
    statusHidden: false,
    firstLogin: 1_368_000_000_000,
    lastLogin: NOW - 3_600_000,
    lastLogout: NOW - 1_800_000,
    lastGame: { id: "BEDWARS", name: "§cBed§fWars" },
  },
  socials: { discord: "anrie", twitter: "https://twitter.com/anrie", youtube: "https://youtube.com/@anrie" },
  games: [],
  updatedAt: NOW - 17 * 60_000,
  expiresAt: NOW - 15 * 60_000,
};

// The fixtures and three of the home preview copies, so every row has its own head.
const rows = [
  [ANRIE_UUID, "§6[2,904✫] §b[MVP§c+§b] anrie", 28_419, 7.42],
  [OJAKEY_UUID, "§d[2,611✫] §6[MVP§2++§6] oJakey", 26_607, 6.9],
  ["618a96fec8b0493fa89427891049550b", "§f[1,980✫] §a[VIP] Preview_BedWars", 22_120, 5.01],
  ["96f645ba026b4e45bc34dd8f0531334c", `§7[412✫] §7${LONG_NAME}`, 999_999_999, 0.5],
  ["20aa2cf67b7443a093b5f3666c160f5f", "§7[38✫] §7Steve", 12, 0.25],
] as const;

export const LEADERBOARD_PAGE: LeaderboardPage = {
  field: "stats.bedwars.overall.wins",
  name: "BedWars Overall Wins",
  fields: ["Wins", "FKDR"],
  page: 0,
  pages: 40_000,
  rows: rows.map(([uuid, name, wins, fkdr], index) => ({
    uuid,
    // The name after the badges, without its colour.
    username: name.slice(name.lastIndexOf(" ") + 1).replaceAll(/§./g, ""),
    position: index + 1,
    name,
    highlight: index === 1,
    values: [wins, fkdr],
  })),
};

export const PROGRESSION = { current: 2_120, max: 5_000, percent: 0.424 };

/** A BedWars cell as `player.game` serves it: the bot's label and colour, and its leaderboard at the overall mode. */
const bedwars = (key: string, value: number, colour: string, label = `stats.${key.slice(key.lastIndexOf(".") + 1)}`): StatCell => ({
  key: `overall.${key}`,
  label,
  value,
  colour,
  leaderboard: `stats.bedwars.overall.${key}`,
});

const BEDWARS_MODES = [
  ["overall", "Overall"],
  ["core", "Core"],
  ["solo", "Solo"],
  ["doubles", "Doubles"],
  ["threes", "Threes"],
  ["fours", "Fours"],
  ["4v4", "4v4"],
  ["armed", "Armed"],
  ["castle", "Castle"],
  ["lucky", "Lucky"],
  ["rush", "Rush"],
  ["swap", "Swap"],
  ["ultimate", "Ultimate"],
  ["underworld", "Underworld"],
  ["voidless", "Voidless"],
  ["oneBlock", "One Block"],
] as const;

/** anrie's BedWars level. */
export const GAME_LEVEL: NonNullable<GamePage["level"]> = {
  label: "stats.level",
  current: "§6[281✫]",
  natural: "§6[281✫]",
  next: "§6[282✫]",
  progression: PROGRESSION,
  progress: "stats.progression.exp",
  leaderboard: "stats.bedwars.exp",
};

/** anrie's BedWars page in the overall mode, with a slumber wallet. */
export const GAME_PAGE: GamePage = {
  uuid: ANRIE_UUID,
  username: "anrie",
  displayName: "§b[MVP§c+§b] anrie",
  game: { key: "bedwars", id: "BEDWARS", name: "§cBed§fWars§f" },
  heading: { word: "game.stats", mode: "Overall" },
  modes: BEDWARS_MODES.map(([key, name]) => ({ key, name })),
  mode: "overall",
  submodes: [],
  submode: null,
  level: GAME_LEVEL,
  overview: [
    { ...bedwars("tokens", 1_234_567, "§2"), key: "tokens", leaderboard: "stats.bedwars.tokens" },
    { ...bedwars("slumber.tickets", 12, "§b", "stats.slumberTickets"), key: "slumber.tickets", of: 25, leaderboard: "stats.bedwars.slumber.tickets" },
    {
      ...bedwars("slumber.totalTickets", 340, "§d", "stats.totalSlumberTickets"),
      key: "slumber.totalTickets",
      leaderboard: "stats.bedwars.slumber.totalTickets",
    },
  ],
  sections: [
    {
      title: null,
      rows: [
        [bedwars("wins", 3_325, "§a"), bedwars("losses", 1_207, "§c"), bedwars("wlr", 2.75, "§6")],
        [bedwars("finalKills", 6_980, "§a"), bedwars("finalDeaths", 1_520, "§c"), bedwars("fkdr", 4.59, "§6")],
        [bedwars("kills", 12_345, "§a"), bedwars("deaths", 9_876, "§c"), bedwars("kdr", 1.25, "§6")],
        [bedwars("bedsBroken", 2_945, "§a"), bedwars("bedsLost", 1_100, "§c"), bedwars("bblr", 2.68, "§6")],
      ],
    },
    {
      title: "game.sections.resources",
      rows: [
        [
          bedwars("itemsCollected.iron", 1_523_422, "§7", "stats.iron"),
          bedwars("itemsCollected.gold", 412_233, "§6", "stats.gold"),
          bedwars("itemsCollected.diamond", 33_112, "§b", "stats.diamonds"),
          bedwars("itemsCollected.emerald", 8_201, "§2", "stats.emeralds"),
        ],
      ],
    },
    { title: "game.sections.games", rows: [[bedwars("gamesPlayed", 4_532, "§e"), bedwars("winstreak", 12, "§a")]] },
  ],
  updatedAt: NOW - 17 * 60_000,
  expiresAt: NOW - 15 * 60_000,
};

/** A Duels-like page: a mode with submodes, a title for a level and a kit the player has selected. */
export const SUBMODE_PAGE: GamePage = {
  ...GAME_PAGE,
  game: { key: "duels", id: "DUELS", name: "§bDuels§f" },
  heading: { word: "game.stats", mode: "Bridge Doubles" },
  modes: [
    { key: "overall", name: "Overall" },
    { key: "bridge", name: "Bridge" },
    { key: "classic", name: "Classic", selected: true },
  ],
  mode: "bridge",
  submodes: [
    { key: "overall", name: "Overall" },
    { key: "solo", name: "Solo" },
    { key: "doubles", name: "Doubles" },
  ],
  submode: "doubles",
};

/** BlitzSG's 45 modes: too many for tabs, so a select at every width. */
export const MANY_MODES: GamePage["modes"] = Array.from({ length: 45 }, (_, index) => ({
  key: index === 0 ? "overall" : `kit${index}`,
  name: index === 0 ? "Overall" : `Kit ${index}`,
  ...(index === 7 && { selected: true }),
}));

const listCell = (key: string, name: string, value: number | string, leaderboard = true): StatCell => ({
  key,
  label: "stats.bestTime",
  name,
  value,
  colour: "§f",
  leaderboard: leaderboard ? `stats.arcade.dropper.maps.${key}.bestTime` : null,
});

/** A list, as Dropper's best times: the card's names in their own colours, a time never set as N/A with no link. */
export const LIST_SECTION: StatSection = {
  title: "game.sections.bestTimes",
  list: true,
  rows: [
    [
      listCell("atlantis", "§cAtlantis", "41.205s"),
      listCell("bbq", "§cBBQ", "38.771s"),
      listCell("floatingIslands", "§eFloating Islands", "1m, 2s"),
      listCell("time", "§eTime", "§7N/A", false),
      listCell("well", "§aWell", "22.006s"),
      listCell("ufo", "§aUFO", "§7N/A", false),
    ],
  ],
};

/** Selections the card shows (a kit) and a stat in a hex colour the theme has no class for. */
export const SELECTION_SECTION: StatSection = {
  title: null,
  rows: [
    [
      { key: "miniWalls.witherKills", label: "stats.witherKills", value: 42, colour: "§#417286", leaderboard: "stats.arcade.miniWalls.witherKills" },
      { key: "miniWalls.witherDamage", label: "stats.witherDamage", value: 12_840, colour: "§#0668af", leaderboard: null },
    ],
    [{ key: "miniWalls.kit", label: "stats.kit", value: "Soldier", colour: "§b", leaderboard: null, inline: true }],
  ],
};
