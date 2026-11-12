/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GUILD_COOLDOWN_MS } from "#guild";
import { type GameId, type Guild, GuildMember } from "@statsify/schemas";
import { gameName } from "./names.js";
import { guildSummary, isNamed } from "./home-previews.js";
import { removeFormatting } from "@statsify/util";
import type { GuildPage } from "@statsify/contract";

export function buildGuildPage(guild: Guild): GuildPage {
  const priorities = new Map(guild.ranks.map((rank) => [rank.name, rank.priority]));

  return {
    ...guildSummary(guild),
    scaledDaily: guild.scaledDaily,
    scaledWeekly: guild.scaledWeekly,
    scaledMonthly: guild.scaledMonthly,
    history: guild.expHistoryDays.map((day, index) => ({ day, exp: guild.expHistory[index] })),
    expByGame: Object.entries(guild.expByGame)
      .filter(([, exp]) => exp > 0)
      .map(([id, exp]) => ({ id, name: removeFormatting(gameName(id as GameId)), exp }))
      .toSorted((a, b) => b.exp - a.exp),
    members: guild.members.filter(isNamed).map((member) => ({
      uuid: member.uuid,
      username: member.username,
      displayName: member.displayName,
      rank: member.rank,
      rankPriority: GuildMember.isGuildMaster(member) ? Number.MAX_SAFE_INTEGER : (priorities.get(member.rank) ?? 0),
      joinTime: member.joinTime,
      questParticipation: member.questParticipation,
      daily: member.daily,
      weekly: member.weekly,
      monthly: member.monthly,
    })),
    updatedAt: guild.expiresAt - GUILD_COOLDOWN_MS,
  };
}
