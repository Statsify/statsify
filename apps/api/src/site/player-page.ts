/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, type GameId, type Player, type PlayerStats, getNetworkExp } from "@statsify/schemas";
import type { GameSummary, PlayerPage } from "@statsify/contract";
import { findScore } from "@statsify/util";

/** Hypixel's network-level coin multiplier from each first level, ascending, without any rank bonus. */
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

/** `PlayerService.get` refreshes a player from Hypixel at most once per this cooldown. */
export const PLAYER_COOLDOWN_MS = 120_000;

type Value = (stats: PlayerStats) => number | string | undefined;

interface Summary {
  id: GameId;
  /** Minecraft-formatted level or prefix for the panel title. */
  level?: (stats: PlayerStats) => string | undefined;
  /** From the game's own play counts: games played where it stores them, else its wins, losses, kills and deaths. */
  played: (stats: PlayerStats) => boolean;
  /** Up to four `[stats.* locale key, value]` rows. */
  rows: [key: string, value: Value, suffix?: string][];
}

const anyCount = (...counts: number[]) => counts.some((count) => count > 0);

/**
 * What each game panel shows: four headline numbers from the overall mode, picked by hand.
 */
const GAME_SUMMARIES: Summary[] = [
  {
    id: "BEDWARS",
    level: (s) => s.bedwars.levelFormatted,
    played: ({ bedwars }) => bedwars.overall.gamesPlayed > 0,
    rows: [
      ["wins", (s) => s.bedwars.overall.wins],
      ["finalKills", (s) => s.bedwars.overall.finalKills],
      ["fkdr", (s) => s.bedwars.overall.fkdr],
      ["bedsBroken", (s) => s.bedwars.overall.bedsBroken],
    ],
  },
  {
    id: "SKYWARS",
    level: (s) => s.skywars.levelFormatted,
    played: ({ skywars }) => skywars.overall.gamesPlayed > 0,
    rows: [
      ["wins", (s) => s.skywars.overall.wins],
      ["kills", (s) => s.skywars.overall.kills],
      ["kdr", (s) => s.skywars.overall.kdr],
      ["wlr", (s) => s.skywars.overall.wlr],
    ],
  },
  {
    id: "DUELS",
    played: ({ duels: { overall } }) => anyCount(overall.wins, overall.losses, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.duels.overall.wins],
      ["kills", (s) => s.duels.overall.kills],
      ["wlr", (s) => s.duels.overall.wlr],
      ["bestWinstreak", (s) => s.duels.overall.bestWinstreak],
    ],
  },
  {
    id: "ARCADE",
    // Its games' wins, and the games played or deaths of the games that store them, for a player who never won.
    played: ({ arcade }) =>
      anyCount(
        arcade.wins,
        arcade.bountyHunters.deaths,
        arcade.disasters.gamesPlayed,
        arcade.dropper.gamesPlayed,
        arcade.galaxyWars.deaths,
        arcade.miniWalls.deaths,
        arcade.pixelParty.overall.gamesPlayed,
        arcade.throwOut.deaths,
        arcade.zombies.overall.deaths
      ),
    rows: [
      ["wins", (s) => s.arcade.wins],
      ["coins", (s) => s.arcade.coins],
    ],
  },
  {
    id: "ARENA_BRAWL",
    level: (s) => s.arenabrawl.naturalPrefix,
    played: ({ arenabrawl: { overall } }) => anyCount(overall.wins, overall.losses, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.arenabrawl.overall.wins],
      ["kills", (s) => s.arenabrawl.overall.kills],
      ["kdr", (s) => s.arenabrawl.overall.kdr],
      ["wlr", (s) => s.arenabrawl.overall.wlr],
    ],
  },
  {
    id: "BLITZSG",
    level: (s) => s.blitzsg.naturalPrefix,
    played: ({ blitzsg: { overall } }) => anyCount(overall.wins, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.blitzsg.overall.wins],
      ["kills", (s) => s.blitzsg.overall.kills],
      ["kdr", (s) => s.blitzsg.overall.kdr],
      ["coins", (s) => s.blitzsg.coins],
    ],
  },
  {
    id: "BUILD_BATTLE",
    level: (s) => s.buildbattle.titleFormatted,
    // It stores no games played or losses, so score and correct guesses count a player who never won.
    played: ({ buildbattle }) => anyCount(buildbattle.overall.wins, buildbattle.score, buildbattle.correctGuesses),
    rows: [
      ["wins", (s) => s.buildbattle.overall.wins],
      ["score", (s) => s.buildbattle.score],
      ["correctGuesses", (s) => s.buildbattle.correctGuesses],
      ["votes", (s) => s.buildbattle.votes],
    ],
  },
  {
    id: "COPS_AND_CRIMS",
    level: (s) => s.copsandcrims.levelFormatted,
    played: ({ copsandcrims: { overall } }) => anyCount(overall.wins, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.copsandcrims.overall.wins],
      ["kills", (s) => s.copsandcrims.overall.kills],
      ["kdr", (s) => s.copsandcrims.overall.kdr],
      ["headshotKills", (s) => s.copsandcrims.overall.headshotKills],
    ],
  },
  {
    id: "MEGAWALLS",
    played: ({ megawalls: { overall } }) => anyCount(overall.wins, overall.losses, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.megawalls.overall.wins],
      ["finalKills", (s) => s.megawalls.overall.finalKills],
      ["fkdr", (s) => s.megawalls.overall.fkdr],
      ["witherKills", (s) => s.megawalls.overall.witherKills],
    ],
  },
  {
    id: "MURDER_MYSTERY",
    played: ({ murdermystery }) => murdermystery.overall.gamesPlayed > 0,
    rows: [
      ["wins", (s) => s.murdermystery.overall.wins],
      ["kills", (s) => s.murdermystery.overall.kills],
      ["murdererWins", (s) => s.murdermystery.overall.murdererWins],
      ["detectiveWins", (s) => s.murdermystery.overall.detectiveWins],
    ],
  },
  {
    id: "PAINTBALL",
    level: (s) => s.paintball.naturalPrefix,
    played: ({ paintball }) => anyCount(paintball.wins, paintball.kills, paintball.deaths),
    rows: [
      ["wins", (s) => s.paintball.wins],
      ["kills", (s) => s.paintball.kills],
      ["kdr", (s) => s.paintball.kdr],
      ["shotAccuracy", (s) => s.paintball.shotAccuracy, "%"],
    ],
  },
  {
    id: "PIT",
    level: (s) => s.pit.levelFormatted,
    played: ({ pit }) => anyCount(pit.kills, pit.deaths),
    rows: [
      ["kills", (s) => s.pit.kills],
      ["deaths", (s) => s.pit.deaths],
      ["kdr", (s) => s.pit.kdr],
      ["gold", (s) => s.pit.gold],
    ],
  },
  {
    id: "QUAKE",
    level: (s) => s.quake.naturalPrefix,
    played: ({ quake: { overall } }) => anyCount(overall.wins, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.quake.overall.wins],
      ["kills", (s) => s.quake.overall.kills],
      ["kdr", (s) => s.quake.overall.kdr],
      ["headshots", (s) => s.quake.overall.headshots],
    ],
  },
  {
    id: "SMASH_HEROES",
    level: (s) => s.smashheroes.levelFormatted,
    played: ({ smashheroes: { overall } }) => anyCount(overall.wins, overall.losses, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.smashheroes.overall.wins],
      ["kills", (s) => s.smashheroes.overall.kills],
      ["kdr", (s) => s.smashheroes.overall.kdr],
      ["wlr", (s) => s.smashheroes.overall.wlr],
    ],
  },
  {
    id: "SPEED_UHC",
    level: (s) => s.speeduhc.levelFormatted,
    played: ({ speeduhc: { overall } }) => anyCount(overall.wins, overall.losses, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.speeduhc.overall.wins],
      ["kills", (s) => s.speeduhc.overall.kills],
      ["kdr", (s) => s.speeduhc.overall.kdr],
      ["wlr", (s) => s.speeduhc.overall.wlr],
    ],
  },
  {
    id: "TNT_GAMES",
    // Only its modes store losses, kills and deaths.
    played: ({ tntgames: { wins, tntRun, bowSpleef, pvpRun, wizards, tntTag } }) =>
      anyCount(wins, tntRun.losses, bowSpleef.losses, pvpRun.kills, pvpRun.deaths, wizards.kills, wizards.deaths, tntTag.kills, tntTag.deaths),
    rows: [
      ["wins", (s) => s.tntgames.wins],
      ["coins", (s) => s.tntgames.coins],
    ],
  },
  {
    id: "TURBO_KART_RACERS",
    played: ({ turbokartracers }) => turbokartracers.gamesPlayed > 0,
    rows: [
      ["goldTrophies", (s) => s.turbokartracers.gold],
      ["silverTrophies", (s) => s.turbokartracers.silver],
      ["bronzeTrophies", (s) => s.turbokartracers.bronze],
      ["lapsCompleted", (s) => s.turbokartracers.lapsCompleted],
    ],
  },
  {
    id: "UHC",
    level: (s) => s.uhc.levelFormatted,
    played: ({ uhc: { overall } }) => anyCount(overall.wins, overall.kills, overall.deaths),
    rows: [
      ["wins", (s) => s.uhc.overall.wins],
      ["kills", (s) => s.uhc.overall.kills],
      ["kdr", (s) => s.uhc.overall.kdr],
      ["headsEaten", (s) => s.uhc.overall.headsEaten],
    ],
  },
  {
    id: "VAMPIREZ",
    played: ({ vampirez: { human, vampire, zombieKills } }) =>
      anyCount(human.wins, human.kills, human.deaths, vampire.wins, vampire.kills, vampire.deaths, zombieKills),
    rows: [
      ["overallWins", (s) => s.vampirez.overallWins],
      ["zombieKills", (s) => s.vampirez.zombieKills],
      ["mostVampireKills", (s) => s.vampirez.mostVampireKills],
      ["coins", (s) => s.vampirez.coins],
    ],
  },
  {
    id: "WALLS",
    level: (s) => s.walls.naturalPrefix,
    played: ({ walls }) => anyCount(walls.wins, walls.losses, walls.kills, walls.deaths),
    rows: [
      ["wins", (s) => s.walls.wins],
      ["kills", (s) => s.walls.kills],
      ["kdr", (s) => s.walls.kdr],
      ["wlr", (s) => s.walls.wlr],
    ],
  },
  {
    id: "WARLORDS",
    level: (s) => s.warlords.titleFormatted,
    played: ({ warlords }) => warlords.gamesPlayed > 0,
    rows: [
      ["wins", (s) => s.warlords.wins],
      ["kills", (s) => s.warlords.kills],
      ["kdr", (s) => s.warlords.kdr],
      ["wlr", (s) => s.warlords.wlr],
    ],
  },
  {
    id: "WOOLGAMES",
    level: (s) => s.woolgames.levelFormatted,
    // Capture The Wool stores no games played.
    played: ({ woolgames: { woolwars, sheepwars, captureTheWool } }) =>
      anyCount(woolwars.overall.gamesPlayed, sheepwars.gamesPlayed, captureTheWool.wins, captureTheWool.losses, captureTheWool.kills, captureTheWool.deaths),
    rows: [
      ["wins", (s) => s.woolgames.wins],
      // Out of 100, as the card prints it.
      ["layers", (s) => `§a${s.woolgames.layers}§8/§a100`],
      ["wool", (s) => s.woolgames.coins],
    ],
  },
];

/** A game panel, or `undefined` for a game the player has never played, which the page leaves out. */
function summarize(stats: PlayerStats, summary: Summary): GameSummary | undefined {
  if (!summary.played(stats)) return undefined;

  const rows = summary.rows.flatMap(([key, read, suffix]) => {
    const value = read(stats);
    return value === undefined ? [] : [{ key, value, ...(suffix && { suffix }) }];
  });

  return { id: summary.id, name: FormattedGame[summary.id], level: summary.level?.(stats), rows };
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
      lastGame: lastGame ? { id: lastGame, name: FormattedGame[lastGame] } : null,
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
    updatedAt: player.expiresAt - PLAYER_COOLDOWN_MS,
    expiresAt: player.expiresAt,
  };
}
