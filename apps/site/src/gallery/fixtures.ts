/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { GamePage, LeaderboardPage, PlayerPage, ResultCard, StatCell, StatSection, Suggestion } from "@statsify/contract";

// The local run's two fixture players, so skins and the signature image resolve against a seeded API.
export const ANRIE_UUID = "3abe2f6bd45a4e2282d4f9014569db25";
export const OJAKEY_UUID = "41825ee5f46b406b9bb74aea7eb2742b";

/** Every name the stress test asks for: the longest name, guild tag and nine-digit numbers. */
const LONG_NAME = "WWWWWWWWWWWWWWWW";

export const SUGGESTIONS: Suggestion[] = [
  { name: "anrie", displayName: "§b[MVP§c+§b] anrie" },
  { name: "anrieTheSecond", displayName: "§a[VIP] anrieTheSecond" },
  { name: "Andromeda", displayName: "§6[MVP§2++§6] Andromeda" },
  { name: "AnnaBanana", displayName: "§7AnnaBanana" },
  { name: "annoyingorange", displayName: null },
  { name: "Antlers", displayName: "§b[MVP] Antlers" },
];

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
  formatted: "§cBed§fWars§f Overall Wins",
  game: "BEDWARS",
  glossary: "wins",
  columns: [
    { field: "stats.bedwars.overall.wins", name: "Wins", label: "stats.wins", color: "§a" },
    { field: "stats.bedwars.overall.fkdr", name: "FKDR", label: "stats.fkdr", color: "§6" },
  ],
  page: 0,
  pages: 40_000,
  rows: rows.map(([uuid, name, wins, fkdr], index) => ({
    uuid,
    // The name after the badges, without its color.
    username: name.slice(name.lastIndexOf(" ") + 1).replaceAll(/§./g, ""),
    position: index + 1,
    name,
    highlight: index === 1,
    values: [wins, fkdr],
  })),
};

export const PROGRESSION = { current: 2_120, max: 5_000, percent: 0.424 };

/** A BedWars cell as `player.game` serves it: the bot's label and color, and its leaderboard at the overall mode. */
const bedwars = (key: string, value: number, color: string, label = `stats.${key.slice(key.lastIndexOf(".") + 1)}`): StatCell => ({
  key: `overall.${key}`,
  label,
  value,
  color,
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

/** The player's game pages for the nav, Arcade never played. */
const GAME_NAV: GamePage["games"] = [
  { key: "arcade", id: "ARCADE", name: "§cA§6r§ec§aa§bd§de§f", played: false },
  { key: "bedwars", id: "BEDWARS", name: "§cBed§fWars§f", played: true },
  { key: "blitzsg", id: "BLITZSG", name: "§2Blitz§6SG§f", played: true },
  { key: "duels", id: "DUELS", name: "§bDuels§f", played: true },
  { key: "challenges", id: null, name: "§aChallenges", played: true },
];

/** Every game with a page, as the nav will list them once all are built: past 10, the Games button at every width. */
export const GAME_NAV_ALL: GamePage["games"] = [
  { key: "arcade", id: "ARCADE", name: "§cA§6r§ec§aa§bd§de§f", played: false },
  { key: "arenabrawl", id: "ARENA_BRAWL", name: "§3Arena §6Brawl§f", played: true },
  { key: "bedwars", id: "BEDWARS", name: "§cBed§fWars§f", played: true },
  { key: "blitzsg", id: "BLITZSG", name: "§2Blitz§6SG§f", played: true },
  { key: "buildbattle", id: "BUILD_BATTLE", name: "§dBuild Battle§f", played: true },
  { key: "copsandcrims", id: "COPS_AND_CRIMS", name: "§6Cops §fand §aCrims§f", played: false },
  { key: "duels", id: "DUELS", name: "§bDuels§f", played: true },
  { key: "megawalls", id: "MEGAWALLS", name: "§7MegaWalls§f", played: true },
  { key: "murdermystery", id: "MURDER_MYSTERY", name: "§4Murder Mystery§f", played: true },
  { key: "paintball", id: "PAINTBALL", name: "§bPaint§fball§f", played: false },
  { key: "pit", id: "PIT", name: "§eThe §aPit§f", played: true },
  { key: "parkour", id: "PARKOUR", name: "§fParkour§f", played: true },
  { key: "quake", id: "QUAKE", name: "§5Quake§f", played: true },
  { key: "skywars", id: "SKYWARS", name: "§bSky§eWars§f", played: true },
  { key: "smashheroes", id: "SMASH_HEROES", name: "§dSmash §eHeroes§f", played: true },
  { key: "speeduhc", id: "SPEED_UHC", name: "§bSpeed§6UHC§f", played: true },
  { key: "tntgames", id: "TNT_GAMES", name: "§cT§fN§cT Games§f", played: true },
  { key: "turbokartracers", id: "TURBO_KART_RACERS", name: "§aTurbo Kart Racers§f", played: false },
  { key: "uhc", id: "UHC", name: "§6UHC§f", played: true },
  { key: "vampirez", id: "VAMPIREZ", name: "§4VampireZ§f", played: true },
  { key: "walls", id: "WALLS", name: "§eWalls§f", played: false },
  { key: "warlords", id: "WARLORDS", name: "§cWar§elords§f", played: true },
  { key: "woolgames", id: "WOOLGAMES", name: "§cWool§9Games§f", played: true },
  { key: "challenges", id: null, name: "§aChallenges", played: true },
];

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
  // Fours played most, by games played.
  modes: BEDWARS_MODES.map(([key, name]) => ({ key, name, ...(key === "fours" && { mostPlayed: "gamesPlayed" as const }) })),
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
        [
          { ...bedwars("finalKills", 6_980, "§a"), short: "stats.kills" },
          { ...bedwars("finalDeaths", 1_520, "§c"), short: "stats.deaths" },
          bedwars("fkdr", 4.59, "§6"),
        ],
        [bedwars("kills", 12_345, "§a"), bedwars("deaths", 9_876, "§c"), bedwars("kdr", 1.25, "§6")],
        [bedwars("bedsBroken", 2_945, "§a"), bedwars("bedsLost", 1_100, "§c"), bedwars("bblr", 2.68, "§6")],
      ],
      rowTitles: [null, "game.table.final", "game.table.normal", null],
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
  games: GAME_NAV,
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
  color: "§f",
  leaderboard: leaderboard ? `stats.arcade.dropper.maps.${key}.bestTime` : null,
});

/** A list, as Dropper's best times: the card's names in their own colors, a time never set as N/A with no link. */
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

/** Duels titles: the card's own formatting, bold only where a title is. */
export const TITLE_LIST: StatSection = {
  title: "game.sections.titles",
  list: true,
  plain: true,
  rows: [
    [
      { key: "sumo.wins", label: "stats.wins", name: "§4§lSumo Legend", value: 2206, color: "§f", leaderboard: "stats.duels.sumo.wins" },
      { key: "bridge.overall.wins", label: "stats.wins", name: "§3Bridge Diamond IV", value: 816, color: "§f", leaderboard: "stats.duels.bridge.overall.wins" },
      { key: "bow.wins", label: "stats.wins", name: "§7Bow Rookie II", value: 30, color: "§f", leaderboard: "stats.duels.bow.wins" },
    ],
  ],
};

/** Selections the card shows (a kit) and a stat in a hex color the theme has no class for. */
export const SELECTION_SECTION: StatSection = {
  title: null,
  rows: [
    [
      { key: "miniWalls.witherKills", label: "stats.witherKills", value: 42, color: "§#417286", leaderboard: "stats.arcade.miniWalls.witherKills" },
      { key: "miniWalls.witherDamage", label: "stats.witherDamage", value: 12_840, color: "§#0668af", leaderboard: null },
    ],
    [{ key: "miniWalls.kit", label: "stats.kit", value: "Soldier", color: "§b", leaderboard: null, inline: true }],
  ],
};
