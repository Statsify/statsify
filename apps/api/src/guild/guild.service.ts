/* eslint-disable require-atomic-updates */
import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import {
  GuildNotFoundException,
  GuildQuery,
  HypixelCache,
  PlayerNotFoundException,
} from '@statsify/api-client';
import { Logger } from '@statsify/logger';
import { deserialize, Guild, GuildMember, Player, serialize } from '@statsify/schemas';
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
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  public async get(
    inputtedTag: string,
    type: GuildQuery,
    cache: HypixelCache
  ): Promise<Guild | null> {
    // eslint-disable-next-line prefer-const
    let [cachedGuild, tag] = await this.getCachedGuild(inputtedTag, type);

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
      throw new GuildNotFoundException();
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
        ...member.expHistoryDays.reduce(
          (acc, day, index) => ({ ...acc, [day]: member.expHistory[index] }),
          {}
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
      .where('uuid')
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

        if (index < 7) guild.weekly += exp;
        guild.monthly += exp;
      });

    guild.daily = guild.expHistory[0];

    //Cache guilds responses for 10 minutes
    guild.expiresAt = Date.now() + 600000;

    const flatGuild = flatten(guild);

    await this.guildModel
      .replaceOne({ id: guild.id }, serialize(Guild, flatGuild), { upsert: true })
      .lean()
      .exec();

    return deserialize(Guild, flatGuild);
  }

  private async getCachedGuild(
    tag: string,
    type: GuildQuery
  ): Promise<[guild: Guild | null, tag: string]> {
    tag = tag.toLowerCase();

    if (type === GuildQuery.PLAYER) {
      const player = await this.playerService.get(tag, HypixelCache.CACHE_ONLY, {
        uuid: true,
        guildId: true,
      });

      if (!player) throw new PlayerNotFoundException();

      if (!player.guildId) return [null, player.uuid];

      const guild = (await this.guildModel
        .findOne()
        .where('id')
        .equals(player.guildId)
        .lean()
        .exec()) as Guild;

      return [guild, player.uuid];
    }

    const guild = (await this.guildModel
      .findOne()
      .where(type === GuildQuery.ID ? 'id' : 'nameToLower')
      .equals(tag)
      .lean()
      .exec()) as Guild;

    return [guild, tag];
  }

  private async handleGuildNotFound(cachedGuild: Guild | null, tag: string, type: GuildQuery) {
    //There is nothing to delete so just escape
    if (!cachedGuild) return;

    if (type === GuildQuery.PLAYER) {
      //Remove this guild id from the player document, because the player is no longer in the guild
      return await this.playerModel
        .updateOne({ $unset: { guildId: '' } })
        .where('uuid')
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
      member.expiresAt = Date.now() + 86400000;
      return;
    }

    if (!member.username) {
      this.logger.error(`Could not get username data for: ${member.uuid}`);

      member.username = `ERROR ${member.uuid}`;
      member.displayName = member.username;

      //Try again in 10 minutes
      member.expiresAt = Date.now() + 600000;
    }
  }

  private scaleGexp(exp: number) {
    if (exp <= 200000) return exp;
    if (exp <= 700000) return (exp - 200000) / 10 + 200000;
    return Math.round((exp - 700000) / 33 + 250000);
  }
}
