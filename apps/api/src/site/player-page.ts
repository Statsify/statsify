/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, type GameId, type Player, type PlayerStats, getNetworkExp } from "@statsify/schemas";
import { type GameSummary, type PlayerPage, levelMultiplier } from "@statsify/contract";
import { PLAYER_COOLDOWN_MS } from "./cooldown.js";
import { winstreaksHidden } from "./game-pages/duels.js";
import { gamePageOf } from "./game-pages/index.js";

/** The guild fields the page reads, deserialized: its name and tag plus each member's quest and GEXP rows. */
export interface PlayerGuild {
  id: string;
  name: string;
  tag?: string;
  tagFormatted?: string;
  members: { uuid: string; questParticipation: number; daily: number; weekly: number }[];
}

type Value = (stats: PlayerStats) => number | string | undefined;

interface Summary {
  id: GameId;
  /** Minecraft-formatted level or prefix for the panel title. */
  level?: (stats: PlayerStats) => string | undefined;
  /** Up to four `[stats.* locale key, value]` rows. */
  rows: [key: string, value: Value, suffix?: string][];
}

/**
 * What each game panel shows: four headline numbers from the overall mode, picked by hand.
 */
const GAME_SUMMARIES: Summary[] = [
  {
    id: "BEDWARS",
    level: (s) => s.bedwars.levelFormatted,
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
    rows: [
      ["wins", (s) => s.skywars.overall.wins],
      ["kills", (s) => s.skywars.overall.kills],
      ["kdr", (s) => s.skywars.overall.kdr],
      ["wlr", (s) => s.skywars.overall.wlr],
    ],
  },
  {
    id: "DUELS",
    rows: [
      ["wins", (s) => s.duels.overall.wins],
      ["kills", (s) => s.duels.overall.kills],
      ["wlr", (s) => s.duels.overall.wlr],
      ["bestWinstreak", (s) => (winstreaksHidden(s) ? "§7Hidden" : s.duels.overall.bestWinstreak)],
    ],
  },
  {
    id: "ARCADE",
    rows: [
      ["wins", (s) => s.arcade.wins],
      ["coins", (s) => s.arcade.coins],
    ],
  },
  {
    id: "ARENA_BRAWL",
    level: (s) => s.arenabrawl.naturalPrefix,
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
    rows: [
      ["wins", (s) => s.copsandcrims.overall.wins],
      ["kills", (s) => s.copsandcrims.overall.kills],
      ["kdr", (s) => s.copsandcrims.overall.kdr],
      ["headshotKills", (s) => s.copsandcrims.overall.headshotKills],
    ],
  },
  {
    id: "MEGAWALLS",
    rows: [
      ["wins", (s) => s.megawalls.overall.wins],
      ["finalKills", (s) => s.megawalls.overall.finalKills],
      ["fkdr", (s) => s.megawalls.overall.fkdr],
      ["witherKills", (s) => s.megawalls.overall.witherKills],
    ],
  },
  {
    id: "MURDER_MYSTERY",
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
    rows: [
      ["wins", (s) => s.speeduhc.overall.wins],
      ["kills", (s) => s.speeduhc.overall.kills],
      ["kdr", (s) => s.speeduhc.overall.kdr],
      ["wlr", (s) => s.speeduhc.overall.wlr],
    ],
  },
  {
    id: "TNT_GAMES",
    rows: [
      ["wins", (s) => s.tntgames.wins],
      ["coins", (s) => s.tntgames.coins],
    ],
  },
  {
    id: "TURBO_KART_RACERS",
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
    rows: [
      ["wins", (s) => s.uhc.overall.wins],
      ["kills", (s) => s.uhc.overall.kills],
      ["kdr", (s) => s.uhc.overall.kdr],
      ["headsEaten", (s) => s.uhc.overall.headsEaten],
    ],
  },
  {
    id: "VAMPIREZ",
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
  const rows = summary.rows.flatMap(([key, read, suffix]) => {
    const value = read(stats);
    return value === undefined ? [] : [{ key, value, ...(suffix && { suffix }) }];
  });

  // Ratios and formatted levels follow from the counts, so all-zero counts mean there is nothing to show.
  const played = rows.some((row) => typeof row.value === "number" && row.value > 0);
  if (!played) return undefined;

  return { id: summary.id, name: FormattedGame[summary.id], level: summary.level?.(stats), rows, page: gamePageOf(summary.id) };
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
      multiplier: levelMultiplier(Math.floor(level)),
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
