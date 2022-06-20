/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ErrorResponse,
  GetGuildResponse,
  GuildNotFoundException,
  PlayerNotFoundException,
} from '@statsify/api-client';
import { Auth } from '../auth';
import { GuildDto } from '../dtos';
import { GuildService } from './guild.service';

@Controller('/guild')
@ApiTags('Guild')
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: 'Get a Guild' })
  @ApiOkResponse({ type: GetGuildResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: PlayerNotFoundException })
  @ApiNotFoundResponse({ type: GuildNotFoundException })
  @Get()
  @Auth({ weight: 120 })
  public async getGuild(@Query() { guild: tag, type, cache }: GuildDto) {
    const guild = await this.guildService.get(tag, type, cache);

    return {
      success: !!guild,
      guild,
    };
  }
}
