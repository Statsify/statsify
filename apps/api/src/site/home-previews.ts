/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type {
  ArcadePreview,
  BedWarsPreview,
  DuelsPreview,
  GuildPreview,
  PreviewIdentity,
  SkyWarsPreview,
} from "@statsify/contract";
import { FormattedGame, type GameId, type Guild, GuildMember, type Player, type Progression } from "@statsify/schemas";
import { removeFormatting } from "@statsify/util";

/** The fixed sample players, guild member and leaderboard the home page previews. */
export const HOME_PREVIEWS = {
  bedwars: "618a96fec8b0493fa89427891049550b",
  skywars: "96f645ba026b4e45bc34dd8f0531334c",
  duels: "20aa2cf67b7443a093b5f3666c160f5f",
  arcade: "92a5199614ac4bd181d1f3c951fb719f",
  session: "855c4abb7d2e42a1a8bfa236afed83f3",
  guildMember: "96f645ba026b4e45bc34dd8f0531334c",
  leaderboard: "stats.uhc.score",
} as const;

const progression = ({ current, max, percent }: Progression) => ({ current, max, percent });

export const previewIdentity = (player: Player): PreviewIdentity => ({
  uuid: player.uuid,
  prefixName: player.prefixName,
});

export function bedwarsPreview(player: Player): BedWarsPreview {
  const { bedwars } = player.stats;
  const { overall } = bedwars;
  const { iron, gold, diamond, emerald } = overall.itemsCollected;

  return {
    ...previewIdentity(player),
    progression: progression(bedwars.progression),
    naturalLevelFormatted: bedwars.naturalLevelFormatted,
    nextLevelFormatted: bedwars.nextLevelFormatted,
    tokens: bedwars.tokens,
    overall: {
      wins: overall.wins,
      losses: overall.losses,
      wlr: overall.wlr,
      winstreak: overall.winstreak,
      itemsCollected: { iron, gold, diamond, emerald },
    },
  };
}

export function skywarsPreview(player: Player): SkyWarsPreview {
  const { skywars } = player.stats;
  const { overall } = skywars;

  return {
    ...previewIdentity(player),
    progression: progression(skywars.progression),
    levelFormatted: skywars.levelFormatted,
    naturalLevelFormatted: skywars.naturalLevelFormatted,
    nextLevelFormatted: skywars.nextLevelFormatted,
    coins: skywars.coins,
    tokens: skywars.tokens,
    souls: skywars.souls,
    opals: skywars.opals,
    heads: skywars.heads,
    potionsBrewed: skywars.potionsBrewed,
    overall: { wins: overall.wins, losses: overall.losses, wlr: overall.wlr },
  };
}

export function duelsPreview(player: Player): DuelsPreview {
  const { duels } = player.stats;
  const { overall } = duels;

  return {
    ...previewIdentity(player),
    tokens: duels.tokens,
    pingRange: duels.pingRange,
    overall: {
      wins: overall.wins,
      losses: overall.losses,
      wlr: overall.wlr,
      progression: progression(overall.progression),
      titleFormatted: overall.titleFormatted,
      titleLevelFormatted: overall.titleLevelFormatted,
      nextTitleLevelFormatted: overall.nextTitleLevelFormatted,
      blocksPlaced: overall.blocksPlaced,
      shotsFired: overall.shotsFired,
    },
  };
}

export function arcadePreview(player: Player): ArcadePreview {
  const { arcade } = player.stats;

  return {
    ...previewIdentity(player),
    coins: arcade.coins,
    coinConversions: arcade.coinConversions,
    wins: arcade.wins,
    gameWins: {
      blockingDead: arcade.blockingDead.wins,
      bountyHunters: arcade.bountyHunters.wins,
      disasters: arcade.disasters.wins,
      dragonWars: arcade.dragonWars.wins,
      dropper: arcade.dropper.wins,
      enderSpleef: arcade.enderSpleef.wins,
      farmHunt: arcade.farmHunt.wins,
      football: arcade.football.wins,
      galaxyWars: arcade.galaxyWars.wins,
      hideAndSeek: arcade.hideAndSeek.overall.wins,
      holeInTheWall: arcade.holeInTheWall.wins,
      hypixelSays: arcade.hypixelSays.wins,
      miniWalls: arcade.miniWalls.wins,
      partyGames: arcade.partyGames.wins,
      pixelPainters: arcade.pixelPainters.wins,
      pixelParty: arcade.pixelParty.overall.wins,
      seasonal: arcade.seasonal.totalWins,
      throwOut: arcade.throwOut.wins,
      zombies: arcade.zombies.overall.wins,
    },
  };
}

/** The guild card's slides: info, leveling, today's top GEXP and the featured member (`memberUuid`). */
export function guildPreview(guild: Guild, memberUuid: string): GuildPreview {
  const members = guild.members.map((member) => ({
    uuid: member.uuid,
    displayName: member.displayName ?? "",
    rank: member.rank,
    joinTime: member.joinTime,
    questParticipation: member.questParticipation,
    daily: member.daily,
    weekly: member.weekly,
    monthly: member.monthly,
  }));

  return {
    name: guild.name,
    nameFormatted: guild.nameFormatted,
    tagFormatted: guild.tagFormatted,
    tagColor: guild.tagColor.code,
    description: guild.description ?? "",
    createdAt: guild.createdAt,
    exp: guild.exp,
    level: guild.level,
    progression: progression(guild.progression),
    daily: guild.daily,
    weekly: guild.weekly,
    monthly: guild.monthly,
    // The schema types them as `GameCode`s, but they hold the ids `FormattedGame` is keyed by.
    preferredGames: guild.preferredGames.map((game) => ({ id: game, name: removeFormatting(FormattedGame[game as GameId]) })),
    memberCount: members.length,
    topDaily: members.toSorted((a, b) => b.daily - a.daily).slice(0, 6),
    master: guild.members.find((member) => GuildMember.isGuildMaster(member))?.displayName || null,
    member: members.find((member) => member.uuid === memberUuid) ?? null,
  };
}
