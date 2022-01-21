import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetGuildDto } from './guild.dto';
import { GuildService } from './guild.service';

@Controller('/guild')
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: 'Get a Guild', tags: ['guilds'] })
  @Get()
  public async getGuild(@Query() { guild: tag, type }: GetGuildDto) {
    return this.guildService.findOne(tag, type);
  }
}
