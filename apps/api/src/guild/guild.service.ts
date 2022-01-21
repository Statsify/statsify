import { Injectable } from '@nestjs/common';
import { HypixelService } from '../hypixel/hypixel.service';
import { GuildQueryType } from './guild.dto';

@Injectable()
export class GuildService {
  public constructor(private readonly hypixelService: HypixelService) {}
  public async findOne(tag: string, type: GuildQueryType) {
    return this.hypixelService.getGuild(tag, type.toLowerCase() as 'name' | 'id' | 'player');
  }
}
