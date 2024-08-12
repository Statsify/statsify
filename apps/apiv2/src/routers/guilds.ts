/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Caching, GuildInput } from "#validation";
import { deserialize, Guild, serialize } from "@statsify/schemas";
import { DateTime } from "luxon";
import { Guilds, Players } from "#db";
import { addAutocompleteEntry, createAutocompleteRouter } from "#services/autocomplete";
import { createLeaderboardRouter, addLeaderboardEntries } from "#services/leaderboards";
import { flatten } from "@statsify/util";
import { getPlayer, isUsername } from "#routers/players";
import { procedure, router } from "#routing";
import { Context } from "#trpc";
import { ONE_DAY, ONE_MINUTE, shouldCache } from "#util";

const CACHE_TIME = 10 * ONE_MINUTE;
const MEMBER_NAME_CACHE_TIME = ONE_DAY;

export const guildsRouter = router({
  get: procedure
    .input(z.intersection(GuildInput, z.object({ caching: Caching })))
    .query(async ({ ctx, input }): Promise<Guild> => {
      const guild = await getGuild(ctx, input);
      return saveAndReturnGuild(ctx, guild);
    }),

  getWithMemberNames: procedure
    .input(z.intersection(GuildInput, z.object({ caching: Caching })))
    .query(async ({ ctx, input }): Promise<Guild> => {
      const guild = await getGuild(ctx, input);

      const nonCachedMembers = guild.members.filter((member) => !shouldCache(member, "Cached"));

      if (nonCachedMembers.length === 0) return saveAndReturnGuild(ctx, guild);

      const cachedUsernames = await Players
        .aggregate()
        .match({ uuid: { $in: nonCachedMembers.map((member) => member.uuid) } })
        .project({ uuid: 1, username: 1, displayName: 1 })
        .exec()
        .then((players: { uuid: string; username: string; displayName: string;}[]) => new Map(
          players.map((player) => [player.uuid, { username: player.username, displayName: player.displayName }])
        ));

      ctx.logger.verbose(`Cache usernames aggregate hit ${cachedUsernames.size}/${nonCachedMembers.length}`);

      guild.members = await Promise.all(guild.members.map(async (member) => {
        if (shouldCache(member, "Cached")) return member;

        const cachedMember = cachedUsernames.get(member.uuid);
        
        if (!cachedMember) {
          ctx.logger.verbose(`username cache miss for ${member.uuid}`);
          const player = await getPlayer(ctx, { player: member.uuid, caching: "Live" });
          member.username = player.username;
          member.displayName = player.displayName;
        } else {
          member.username = cachedMember.username;
          member.displayName = cachedMember.displayName;
        }

        member.expiresAt = Date.now() + MEMBER_NAME_CACHE_TIME;

        return member
      }));

     return saveAndReturnGuild(ctx, guild);
    }),

  delete: procedure
    .input(GuildInput)
    .mutation(() => ({ players: [] })),

  leaderboards: createLeaderboardRouter(
    Guild,
    (ids, fields) => Guilds
      .aggregate()
      .match({ id: { $in: ids } })
      .append({ $set: { _index: { $indexOfArray: [ids, "$id"] } } })
      .sort({ _index: 1 })
      .append({ $unset: "_index" })
      .project({ name: 1, ...Object.fromEntries(fields.map((field) => [field, 1])) })
      .exec()
      .then((guilds) => guilds.map((guild) => flatten(guild) as any))
  ),

  autocomplete: createAutocompleteRouter(Guild),
});

async function getGuild(ctx: Context, input: z.TypeOf<typeof GuildInput>): Promise<Guild> {
  let guild: Guild;

  if (input.type === "member") {
    let uuid: string;
    
    if (isUsername(input.tag)) {
      const player = await getPlayer(ctx, { player: input.tag, caching: "Cached" });
      uuid = player.uuid;
    } else {
      uuid = input.tag;
    }

    guild = await ctx.hypixel.guild(uuid, "player");
  } else {
    guild = await ctx.hypixel.guild(input.tag, input.type);
  }

  const cachedGuild = await Guilds
    .findOne()
    .where("id")
    .equals(guild.id)
    .lean()
    .exec()
    .then((guild) => guild === null ? undefined : guild as Guild);

  hydrateGuildMembersWithCache(guild, cachedGuild);

  const expHistory = new Map<string, number>();

  for (const member of guild.members) {
    for (const [index, day] of member.expHistoryDays.entries()) {
      const memberExpForDay = member.expHistory[index];
      const totalExpForDay = expHistory.get(day) ?? 0;
      expHistory.set(day, totalExpForDay + memberExpForDay);
    }
  }

  const sortedExpHistoryEntries = [...expHistory.entries()].sort(([aDate], [bDate]) => aDate.localeCompare(bDate));
  
  guild.expHistoryDays = sortedExpHistoryEntries.map(([date]) => date);
  guild.expHistory = sortedExpHistoryEntries.map(([, exp]) => exp);
  guild.scaledExpHistory = sortedExpHistoryEntries.map(([, exp]) => scaleGexp(exp));

  guild.daily = guild.expHistory[0];
  guild.weekly = guild.expHistory.slice(0, 7).reduce((sum, exp) => sum + exp, 0);
  guild.monthly = guild.expHistory.reduce((sum, exp) => sum + exp, 0);

  guild.scaledDaily = guild.scaledExpHistory[0];
  guild.scaledWeekly = guild.scaledExpHistory.slice(0, 7).reduce((sum, exp) => sum + exp, 0);
  guild.scaledMonthly = guild.scaledExpHistory.reduce((sum, exp) => sum + exp, 0);

  guild.expiresAt = Date.now() + CACHE_TIME;

  return guild;
}

function hydrateGuildMembersWithCache(guild: Guild, cachedGuild: Guild | undefined) {
  if (!cachedGuild) return;

  const cachedMembers = new Map(cachedGuild.members.map((member) => [member.uuid, member]));

  for (const member of guild.members) {
    const cachedMember = cachedMembers.get(member.uuid);
    if (!cachedMember) continue;

    Object.entries(Object.fromEntries(cachedMember
      .expHistoryDays
      .map((day, index) => [day, cachedGuild.expHistory[index]] as const)
      .concat(member.expHistoryDays.map((day, index) => [day, member.expHistory[index]] as const))
    ))
      .filter(([date]) => DateTime.fromFormat(date, "YYYY-MM-DD").diffNow("days").days <= 31)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, exp], index) => {
        member.expHistory[index] = exp;
        member.expHistoryDays[index] = date;
      });

    member.displayName = cachedMember.displayName;
    member.username = cachedMember.username;
    member.expiresAt = cachedMember.expiresAt;
  }
}

function scaleGexp(exp: number) {
  if (exp <= 200_000) return exp;
  if (exp <= 700_000) return (exp - 200_000) / 10 + 200_000;
  return Math.round((exp - 700_000) / 33 + 250_000);
}

function saveAndReturnGuild(ctx: Context, guild: Guild) {
  const flattened = flatten(guild);

  Guilds.replaceOne({ id: guild.id }, serialize(Guild, flattened), { upsert: true }).exec();
  addLeaderboardEntries(ctx, Guild, flattened, "id");
  addAutocompleteEntry(ctx, Guild, guild.name);

  return deserialize(Guild, flattened);
}