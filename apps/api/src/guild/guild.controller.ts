import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GuildService } from './guild.service';

@Controller('/guild')
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: 'Get a Guild', tags: ['guilds'] })
  @Get()
  public async getGuild(
    @Query('guild') tag: string,
    @Query('type') type: 'name' | 'id' | 'player'
  ) {
    return this.guildService.findOne(tag, type);
  }
}
