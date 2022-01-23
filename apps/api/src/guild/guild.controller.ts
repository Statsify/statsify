import { GetGuildDto } from '#dtos/guild.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Guild } from '@statsify/schemas';
import { GuildService } from './guild.service';

@Controller('/guild')
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: 'Get a Guild', tags: ['guilds'] })
  @ApiOkResponse({ type: Guild })
  @Get()
  public async getGuild(@Query() { guild: tag, type, cache }: GetGuildDto) {
    const guild = await this.guildService.findOne(tag, type, cache);

    return {
      success: !!guild,
      guild,
    };
  }
}
