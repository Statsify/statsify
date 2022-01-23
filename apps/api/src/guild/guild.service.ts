import { GuildQueryType } from '#dtos/guild.dto';
import { HypixelCache } from '#hypixel/cache.enum';
import { HypixelService } from '#hypixel/hypixel.service';
import { PlayerService } from '#player/player.service';
import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { deserialize, Guild, serialize } from '@statsify/schemas';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';

@Injectable()
export class GuildService {
  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly playerService: PlayerService,
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>
  ) {}

  public async findOne(
    tag: string,
    type: GuildQueryType,
    cache: HypixelCache
  ): Promise<Guild | null> {
    tag = tag.toLowerCase().replace(/-/g, '');

    const queries: Record<GuildQueryType, FilterQuery<DocumentType<Guild>>> = {
      [GuildQueryType.ID]: { id: tag },
      [GuildQueryType.NAME]: { nameToLower: tag },
      //Searches through the members for a matching uuid
      [GuildQueryType.PLAYER]: { members: { $elemMatch: { uuid: tag } } },
    };

    const cachedGuild = await this.guildModel.findOne(queries[type]).lean().exec();

    if (cachedGuild && this.hypixelService.shouldCache(cachedGuild.expiresAt, cache)) {
      return {
        ...cachedGuild,
        cached: true,
      };
    }

    const guild = await this.hypixelService.getGuild(
      tag,
      type.toLowerCase() as Lowercase<GuildQueryType>
    );

    if (!guild) {
      if (cachedGuild && type !== GuildQueryType.PLAYER) {
        //If the guild is cached however hypixel doesn't return any data for it and it wasn't searched for by a player then the guild does not exist
        await this.guildModel.deleteOne({ id: cachedGuild.id }).lean().exec();
      }

      return null;
    }

    const memberMap = Object.fromEntries(
      (cachedGuild?.members ?? []).map((member) => [member.uuid, member])
    );

    const fetchMembers = guild.members.map(async (member) => {
      const cacheMember = memberMap[member.uuid];

      //Get username/displayName
      if (cacheMember && Date.now() < cacheMember.expiresAt) {
        member.displayName = cacheMember.displayName;
        member.username = cacheMember.username;
        member.expiresAt = cacheMember.expiresAt;
      } else {
        const player = await this.playerService.findOne(member.uuid, HypixelCache.CACHE_ONLY, {
          username: true,
          displayName: true,
        });

        if (player) {
          member.username = player.username;
          member.displayName = player.displayName;

          //Cache names for a day
          member.expiresAt = Date.now() + 86400000;
        } else {
          //Try again in 5 minutes
          member.expiresAt = Date.now() + 300000;
        }
      }

      return member;
    });

    guild.members = await Promise.all(fetchMembers);

    //Cache guilds responses for 5 minutes
    guild.expiresAt = Date.now() + 300000;

    await this.guildModel
      .replaceOne({ id: guild.id }, this.serialize(guild), { upsert: true })
      .lean()
      .exec();

    return this.deserialize(guild);
  }

  public serialize(instance: Guild) {
    return serialize(Guild, instance);
  }

  public deserialize(data: Guild) {
    return deserialize(new Guild(), data);
  }
}
