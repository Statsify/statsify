/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller, Get, Query } from "@nestjs/common";
import {
  ErrorResponse,
  GetGuildResponse,
  GetGuildSearchResponse,
  GuildNotFoundException,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { GuildDto, GuildSearchDto } from "#dtos";
import { GuildService } from "./guild.service.js";

@Controller("/guild")
@ApiTags("Guild")
export class GuildController {
  public constructor(private readonly guildService: GuildService) {}

  @ApiOperation({ summary: "Get a Guild" })
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

  @ApiOperation({ summary: "Get Stored Guild Names Starting With a Query" })
  @ApiOkResponse({ type: GetGuildSearchResponse })
  @Auth({ weight: 0 })
  @Get("/search")
  public async searchGuilds(@Query() { query }: GuildSearchDto) {
    const guilds = await this.guildService.search(query);

    return {
      success: true,
      guilds: guilds.map((guild) => guild.name),
    };
  }
}
