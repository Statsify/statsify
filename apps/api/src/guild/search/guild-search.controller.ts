/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller, Get, Query } from "@nestjs/common";
import { GetGuildSearchResponse } from "@statsify/api-client";
import { GuildSearchDto } from "#dtos";
import { GuildSearchService } from "./guild-search.service.js";

@Controller("/guild/search")
@ApiTags("Guild")
export class GuildSearchController {
  public constructor(private readonly guildSearchService: GuildSearchService) {}

  @ApiOperation({ summary: "Get a Fuzzy Searched List of Guilds" })
  @ApiOkResponse({ type: GetGuildSearchResponse })
  @Auth({ weight: 0 })
  @Get()
  public async getGuilds(@Query() { query = "" }: GuildSearchDto) {
    const guilds = await this.guildSearchService.get(query);

    return {
      success: true,
      guilds,
    };
  }
}
