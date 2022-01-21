import { Injectable } from '@nestjs/common';
import { HypixelService } from '../hypixel/hypixel.service';

@Injectable()
export class GuildService {
  public constructor(private readonly hypixelService: HypixelService) {}
  public async findOne(tag: string, type: 'name' | 'id' | 'player') {
    return this.hypixelService.getGuild(tag, type);
  }
}
