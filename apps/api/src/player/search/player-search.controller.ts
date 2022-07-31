/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "../../auth";
import { Controller, Get, Query } from "@nestjs/common";
import { GetPlayerSearchResponse } from "@statsify/api-client";
import { PlayerSearchDto } from "../../dtos";
import { PlayerSearchService } from "./player-search.service";

@Controller("/player/search")
@ApiTags("Player")
export class PlayerSearchController {
  public constructor(private readonly playerSearchService: PlayerSearchService) {}

  @ApiOperation({ summary: "Get a Fuzzy Searched List of Players" })
  @ApiOkResponse({ type: GetPlayerSearchResponse })
  @Auth({ weight: 0 })
  @Get()
  public async getPlayers(@Query() { query }: PlayerSearchDto) {
    const players = await this.playerSearchService.get(query);

    return {
      success: true,
      players,
    };
  }
}
