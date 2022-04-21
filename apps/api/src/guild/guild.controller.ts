import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ErrorResponse, GetGuildResponse } from '@statsify/api-client';
import { Auth } from '../auth';
import { GuildDto } from '../dtos';
import { GuildService } from './guild.service';

@Controller('/guild')
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: 'Get a Guild', tags: ['Guild'] })
  @ApiOkResponse({ type: GetGuildResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get()
  @Auth({ weight: 120 })
  public async getGuild(@Query() { guild: tag, type, cache }: GuildDto) {
    const guild = await this.guildService.findOne(tag, type, cache);

    return {
      success: !!guild,
      guild,
    };
  }
}
