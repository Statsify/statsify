/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Guild, GuildMember, GuildRank } from "@statsify/schemas";

const getGuildRankMap = (guild: Guild) =>
  guild.ranks.reduce((acc, rank) => {
    acc[rank.name] = rank;
    return acc;
  }, {} as Record<string, GuildRank>);

const getGuildRankName = (guildRankMap: Record<string, GuildRank>, member: GuildMember) => {
  const guildRank = guildRankMap[member.rank];

  return guildRank ?
      `${guildRank.name}${guildRank.tag ? ` [${guildRank.tag}]` : ""}` :
      member.rank;
};

const sortGuildMembers = (guild: Guild) => {
  const guildRankMap = getGuildRankMap(guild);

  return [...guild.members].sort((a, b) => {
    const priority =
      (guildRankMap[b.rank]?.priority ?? 0) - (guildRankMap[a.rank]?.priority ?? 0);

    if (priority !== 0) return priority;

    return (a.displayName ?? a.username ?? a.uuid).localeCompare(
      b.displayName ?? b.username ?? b.uuid
    );
  });
};

export const createGuildListExport = (guild: Guild) => {
  const guildRankMap = getGuildRankMap(guild);
  const lines = sortGuildMembers(guild).map(
    (member) =>
      `${member.displayName ?? member.username ?? member.uuid}\t${getGuildRankName(guildRankMap, member)}`
  );

  return [
    `Guild: ${guild.name}${guild.tag ? ` [${guild.tag}]` : ""}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "Display Name\tGuild Rank",
    ...lines,
  ].join("\n");
};

export const createGuildTopExport = (
  guild: Guild,
  title: string,
  key: "daily" | "weekly" | "monthly" | number
) => {
  const guildRankMap = getGuildRankMap(guild);
  const lines = [...guild.members]
    .map((member) => ({
      member,
      value: typeof key === "string" ? member[key] : member.expHistory[key],
    }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .map(
      ({ member, value }, index) =>
        `${index + 1}\t${member.displayName ?? member.username ?? member.uuid}\t${getGuildRankName(guildRankMap, member)}\t${value ?? 0}`
    );

  return [
    `Guild: ${guild.name}${guild.tag ? ` [${guild.tag}]` : ""}`,
    `Mode: ${title}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "Position\tDisplay Name\tGuild Rank\tGEXP",
    ...lines,
  ].join("\n");
};
