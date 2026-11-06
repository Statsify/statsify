/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { LeaderboardPage, PlayerPage, ResultCard } from "@statsify/contract";

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
