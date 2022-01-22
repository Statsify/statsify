import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Guild } from '@statsify/schemas';
import { GetGuildDto } from './guild.dto';
import { GuildService } from './guild.service';

@Controller('/guild')
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: 'Get a Guild', tags: ['guilds'] })
  @ApiOkResponse({ type: Guild })
  @Get()
  public async getGuild(@Query() { guild: tag, type, cache }: GetGuildDto) {
    return this.guildService.findOne(tag, type, cache);
  }
}
