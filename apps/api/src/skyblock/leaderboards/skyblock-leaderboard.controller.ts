/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { Body, Controller, Post } from "@nestjs/common";
import {
  ErrorResponse,
  LeaderboardQuery,
  PostLeaderboardResponse,
  PostSkyBlockRankingsResponse,
} from "@statsify/api-client";
import { PlayerDto, SkyBlockLeaderboardDto } from "#dtos";
import { SkyBlockLeaderboardService } from "./skyblock-leaderboard.service.js";
import { SkyBlockStats } from "@statsify/schemas";

@Controller("/skyblock/leaderboards")
@ApiTags("SkyBlock")
export class SkyBlockLeaderboardController {
  public constructor(private readonly skyblockLeaderboardService: SkyBlockLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: "Get a SkyBlock Leaderboard", description: "One row per member of a profile." })
  @ApiOkResponse({ type: PostLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.WORKER, weight: 3 })
  public getSkyBlockLeaderboard(@Body() { field, page, player, position }: SkyBlockLeaderboardDto) {
    let input: number | string;
    let type: LeaderboardQuery;

    if (player) {
      input = player;
      type = LeaderboardQuery.INPUT;
    } else if (position) {
      input = position;
      type = LeaderboardQuery.POSITION;
    } else {
      input = page;
      type = LeaderboardQuery.PAGE;
    }

    return this.skyblockLeaderboardService.getLeaderboard(SkyBlockStats, field, input, type);
  }

  @Post("/rankings")
  @ApiOperation({
    summary: "Get a Player's SkyBlock Rankings",
    description: "Every board the player is on, best rank first, each at the player's best profile on it.",
  })
  @ApiOkResponse({ type: [PostSkyBlockRankingsResponse] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 5 })
  public getSkyBlockRankings(@Body() { player }: PlayerDto) {
    return this.skyblockLeaderboardService.getPlayerRankings(player);
  }
}
