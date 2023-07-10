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
  CurrentHistoricalType,
  ErrorResponse,
  LeaderboardQuery,
  PostLeaderboardResponse,
} from "@statsify/api-client";
import { HistoricalLeaderboardDto } from "#dtos";
import { HistoricalLeaderboardService } from "./historical-leaderboard.service.js";
import { Player } from "@statsify/schemas";

@Controller("/historical/leaderboards")
@ApiTags("Historical Leaderboards")
export class HistoricalLeaderboardsController {
  public constructor(
    private readonly historicalLeaderboardService: HistoricalLeaderboardService
  ) {}

  @Post()
  @ApiOperation({ summary: "Get a Historical Leaderboard" })
  @ApiOkResponse({ type: PostLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public getHistoricalLeaderboard(
    @Body() { time, field, page, player, position }: HistoricalLeaderboardDto
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

    return this.historicalLeaderboardService.getHistoricalLeaderboard(
      time as CurrentHistoricalType,
      Player,
      field,
      input,
      type
    );
  }
}
