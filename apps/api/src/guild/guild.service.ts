/* eslint-disable require-atomic-updates */
import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GuildQuery, HypixelCache } from '@statsify/api-client';
import { Logger } from '@statsify/logger';
import { deserialize, Guild, serialize } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import { HypixelService } from '../hypixel';
import { PlayerService } from '../player';

@Injectable()
export class GuildService {
  private readonly logger = new Logger('GuildService');

  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly playerService: PlayerService,
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>
  ) {}

  public async get(tag: string, type: GuildQuery, cache: HypixelCache): Promise<Guild | null> {
    tag = tag.toLowerCase().replace(/-/g, '');

    let cachedGuild: Guild | null = null;

    if (type === GuildQuery.PLAYER) {
      tag = tag.replace(/-/g, '');
      const isUuid = tag.length > 16;

      if (!isUuid) {
        const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
          uuid: true,
        });

        if (!player) throw new NotFoundException(`player`);

        tag = player.uuid;
      }

      cachedGuild = (await this.guildModel
        .findOne({ members: { $elemMatch: { uuid: tag } } })
        .lean()
        .exec()) as Guild;
    } else {
      cachedGuild = (await this.guildModel
        .findOne()
        .where(type === GuildQuery.ID ? 'id' : 'nameToLower')
        .equals(tag)
        .lean()
        .exec()) as Guild;
    }

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
      if (cachedGuild && type !== GuildQuery.PLAYER) {
        //If the guild is cached however hypixel doesn't return any data for it and it wasn't searched for by a player then the guild does not exist
        await this.guildModel.deleteOne({ id: cachedGuild.id }).lean().exec();
      }

      //The guild does not exist
      throw new NotFoundException(`guild`);
    }

    const memberMap = Object.fromEntries(
      (cachedGuild?.members ?? []).map((member) => [member.uuid, member])
    );

    const guildExpHistory: Record<string, number> = {};

    const fetchMembers = guild.members.map(async (member) => {
      const cacheMember = memberMap[member.uuid];

      //Get username/displayName
      if (cacheMember && Date.now() < cacheMember.expiresAt) {
        member.displayName = cacheMember.displayName;
        member.username = cacheMember.username;
        member.expiresAt = cacheMember.expiresAt;
      } else {
        const player = await this.playerService
          .get(member.uuid, HypixelCache.CACHE_ONLY, {
            username: true,
            displayName: true,
          })
          .catch(() => null);

        if (player) {
          member.username = player.username;
          member.displayName = player.displayName;

          //Cache names for a day
          member.expiresAt = Date.now() + 86400000;
        }
      }

      if (!member.username) {
        this.logger.error(`Could not username data for player: ${member.uuid}`);

        member.username = `ERROR ${member.uuid}`;
        member.displayName = member.username;

        //Try again in 10 minutes
        member.expiresAt = Date.now() + 600000;
      }

      const combinedExpHistory: Record<string, number> = {
        ...cacheMember?.expHistoryDays?.reduce(
          (acc, day, index) => ({ ...acc, [day]: cacheMember.expHistory[index] }),
          {}
        ),
        ...member.expHistoryDays.reduce(
          (acc, day, index) => ({ ...acc, [day]: member.expHistory[index] }),
          {}
        ),
      };

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

      return member;
    });

    guild.members = await Promise.all(fetchMembers);

    Object.entries(guildExpHistory)
      .sort()
      .reverse()
      .slice(0, 30)
      .forEach(([day, exp], index) => {
        const scaled = this.scaleGexp(exp);

        guild.expHistory[index] = exp;
        guild.expHistoryDays[index] = day;
        guild.scaledExpHistory[index] = scaled;

        if (index < 7) {
          guild.weekly += exp;
          guild.scaledWeekly += scaled;
        }

        guild.monthly += exp;
        guild.scaledMonthly += scaled;
      });

    //Cache guilds responses for 10 minutes
    guild.expiresAt = Date.now() + 600000;

    const flatGuild = flatten(guild);

    await this.guildModel
      .replaceOne({ id: guild.id }, serialize(Guild, flatGuild), { upsert: true })
      .lean()
      .exec();

    return deserialize(Guild, flatGuild);
  }
  private scaleGexp(exp: number) {
    if (exp <= 200000) return exp;
    if (exp <= 700000) return (exp - 200000) / 10 + 200000;
    return Math.round((exp - 700000) / 33 + 250000);
  }
}
