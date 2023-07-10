/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable require-atomic-updates */
import { Guild, GuildMember, Player, deserialize, serialize } from "@statsify/schemas";
import { GuildLeaderboardService } from "./leaderboards/guild-leaderboard.service.js";
import {
  GuildNotFoundException,
  GuildQuery,
  HypixelCache,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { HypixelService } from "#hypixel";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { PlayerService } from "#player";
import { flatten } from "@statsify/util";
import type { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class GuildService {
  private readonly logger = new Logger("GuildService");

  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly playerService: PlayerService,
    private readonly guildLeaderboardService: GuildLeaderboardService,
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  public async get(
    inputtedTag: string,
    type: GuildQuery,
    cache: HypixelCache
  ): Promise<Guild | null> {
    // eslint-disable-next-line prefer-const
    let [cachedGuild, tag, displayName] = await this.getCachedGuild(inputtedTag, type);

    if (cachedGuild && this.hypixelService.shouldCache(cachedGuild.expiresAt, cache)) {
      return {
        ...deserialize(Guild, flatten(cachedGuild)),
        cached: true,
      };
    }

    const guild = await this.hypixelService.getGuild(
      tag,
      type.toLowerCase() as Lowercase<GuildQuery>
    );

    if (!guild) {
      await this.handleGuildNotFound(cachedGuild, tag, type);
      throw new GuildNotFoundException(displayName);
    }

    //The cached guild doesn't match the one we got from the API, just ignore the cached guild
    if (guild.id !== cachedGuild?.id) {
      cachedGuild = null;
    }

    const memberMap = Object.fromEntries(
      (cachedGuild?.members ?? []).map((member) => [member.uuid, member])
    );

    const guildExpHistory: Record<string, number> = {};
    const requireGuildId: string[] = [];

    const fetchMembers = guild.members.map(async (member) => {
      const cacheMember = memberMap[member.uuid];

      await this.getMemberName(member, cacheMember);

      //These members will need their player document updated with the correct guild id
      if (member.guildId !== guild.id) {
        requireGuildId.push(member.uuid);
        member.guildId = guild.id;
      }

      //Merge the exp history from hypixel and the cached guild
      const combinedExpHistory: Record<string, number> = {
        ...cacheMember?.expHistoryDays?.reduce(
          (acc, day, index) => ({ ...acc, [day]: cacheMember.expHistory[index] }),
          {}
        ),
        ...Object.fromEntries(
          member.expHistoryDays.map((day, index) => [day, member.expHistory[index]])
        ),
      };

      //Add all the days to the guild total exp history
      Object.entries(combinedExpHistory)
        .sort()
        .reverse()
        .slice(0, 30)
        .forEach(([day, exp], index) => {
          member.expHistory[index] = exp;
          member.expHistoryDays[index] = day;
          guildExpHistory[day] = guildExpHistory[day] ? guildExpHistory[day] + exp : exp;
          member.monthly += exp;
        });

      guild.questParticipation = guild.questParticipation + member.questParticipation;

      return member;
    });

    guild.members = await Promise.all(fetchMembers);

    await this.playerModel
      .updateMany({ guildId: guild.id })
      .where("uuid")
      .in(requireGuildId)
      .lean()
      .exec();

    //Get scaled gexp
    Object.entries(guildExpHistory)
      .sort()
      .reverse()
      .slice(0, 30)
      .forEach(([day, exp], index) => {
        const scaled = this.scaleGexp(exp);

        guild.expHistory[index] = exp;
        guild.expHistoryDays[index] = day;
        guild.scaledExpHistory[index] = scaled;

        if (index === 0) {
          guild.daily = exp;
          guild.scaledDaily = scaled;
        }

        if (index < 7) {
          guild.weekly += exp;
          guild.scaledWeekly += scaled;
        }

        guild.monthly += exp;
        guild.scaledMonthly += scaled;
      });

    //Cache guilds responses for 10 minutes
    guild.expiresAt = Date.now() + 600_000;

    const flatGuild = flatten(guild);
    const serializedGuild = serialize(Guild, flatGuild);

    await this.guildModel
      .replaceOne({ id: guild.id }, serializedGuild, { upsert: true })
      .lean()
      .exec();

    await this.guildLeaderboardService.addLeaderboards(Guild, serializedGuild, "id");

    return deserialize(Guild, flatGuild);
  }

  private async getCachedGuild(
    tag: string,
    type: GuildQuery
  ): Promise<[guild: Guild | null, tag: string, displayName?: string]> {
    tag = tag.toLowerCase();

    if (type === GuildQuery.PLAYER) {
      const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
        uuid: true,
        displayName: true,
        guildId: true,
      });

      if (!player) throw new PlayerNotFoundException();

      if (!player.guildId) return [null, player.uuid, player.displayName];

      const guild = (await this.guildModel
        .findOne()
        .where("id")
        .equals(player.guildId)
        .lean()
        .exec()) as Guild;

      return [guild, player.uuid, player.displayName];
    }

    const guild = (await this.guildModel
      .findOne()
      .where(type === GuildQuery.ID ? "id" : "nameToLower")
      .equals(tag)
      .lean()
      .exec()) as Guild;

    return [guild, tag];
  }

  private async handleGuildNotFound(
    cachedGuild: Guild | null,
    tag: string,
    type: GuildQuery
  ) {
    //There is nothing to delete so just escape
    if (!cachedGuild) return;

    if (type === GuildQuery.PLAYER) {
      //Remove this guild id from the player document, because the player is no longer in the guild
      return await this.playerModel
        .updateOne({ $unset: { guildId: "" } })
        .where("uuid")
        .equals(tag)
        .lean()
        .exec();
    }

    return await this.guildModel.deleteOne({ id: cachedGuild.id }).lean().exec();
  }

  private async getMemberName(member: GuildMember, cachedMember?: GuildMember) {
    if (cachedMember && Date.now() < cachedMember.expiresAt) {
      member.displayName = cachedMember.displayName;
      member.username = cachedMember.username;
      member.expiresAt = cachedMember.expiresAt;
      member.guildId = cachedMember.guildId;
      return;
    }

    const player = await this.playerService
      .get(member.uuid, HypixelCache.CACHE_ONLY, {
        username: true,
        displayName: true,
        guildId: true,
      })
      .catch(() => null);

    if (player) {
      member.username = player.username;
      member.displayName = player.displayName;
      member.guildId = player.guildId;

      //Cache names for a day
      member.expiresAt = Date.now() + 86_400_000;
      return;
    }

    if (!member.username) {
      this.logger.error(`Could not get username data for: ${member.uuid}`);

      member.username = `ERROR ${member.uuid}`;
      member.displayName = member.username;

      //Try again in 10 minutes
      member.expiresAt = Date.now() + 600_000;
    }
  }

  private scaleGexp(exp: number) {
    if (exp <= 200_000) return exp;
    if (exp <= 700_000) return (exp - 200_000) / 10 + 200_000;
    return Math.round((exp - 700_000) / 33 + 250_000);
  }
}
