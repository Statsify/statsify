/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Auth } from "#auth";
import { Body, Controller, Post } from "@nestjs/common";
import {
  ErrorResponse,
  LeaderboardQuery,
  PostLeaderboardRankingsResponse,
  PostLeaderboardResponse,
} from "@statsify/api-client";
import { Player } from "@statsify/schemas";
import { PlayerLeaderboardDto, PlayerRankingsDto } from "#dtos";
import { PlayerLeaderboardService } from "./player-leaderboard.service.js";

@Controller("/player/leaderboards")
@ApiTags("Player Leaderboards")
export class PlayerLeaderboardsController {
  public constructor(
    private readonly playerLeaderboardService: PlayerLeaderboardService
  ) {}

  @Post()
  @ApiOperation({ summary: "Get a Player Leaderboard" })
  @ApiOkResponse({ type: PostLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public getPlayerLeaderboard(
  @Body() { field, page, player, position }: PlayerLeaderboardDto
  ) {
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

    return this.playerLeaderboardService.getLeaderboard(Player, field, input, type);
  }

  @Post("/rankings")
  @ApiOperation({ summary: "Get a Player Rankings" })
  @ApiOkResponse({ type: [PostLeaderboardRankingsResponse] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 5 })
  public async getPlayerRankings(@Body() { fields, uuid }: PlayerRankingsDto) {
    return this.playerLeaderboardService.getLeaderboardRankings(Player, fields, uuid);
  }
}
