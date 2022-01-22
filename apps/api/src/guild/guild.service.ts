import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { deserialize, Guild, serialize } from '@statsify/schemas';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';
import { HypixelCache } from '../hypixel/cache.enum';
import { HypixelService } from '../hypixel/hypixel.service';
import { GuildQueryType } from './guild.dto';

@Injectable()
export class GuildService {
  public constructor(
    private readonly hypixelService: HypixelService,
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
      [GuildQueryType.PLAYER]: { $elemMatch: { uuid: tag } },
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
      if (cachedGuild) {
        await this.guildModel.deleteOne({ id: cachedGuild.id }).lean().exec();
      }

      return null;
    }

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
