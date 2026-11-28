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
} from "@nestjs/swagger";
import { Auth } from "#auth";
import { Body, Controller, Post } from "@nestjs/common";
import {
  CacheLevel,
  ErrorResponse,
  GUILD_ID_REGEX,
  GuildNotFoundException,
  GuildQuery,
  PostLeaderboardRankingsResponse,
  PostLeaderboardResponse,
} from "@statsify/api-client";
import { Guild } from "@statsify/schemas";
import { GuildLeaderboardDto, GuildMemberLeaderboardDto, GuildRankingDto } from "#dtos";
import { GuildLeaderboardService } from "./guild-leaderboard.service.js";
import { GuildService } from "../guild.service.js";
import { PlayerLeaderboardService } from "#player";
import { toLeaderboardQuery } from "#leaderboards";

@Controller("/guild/leaderboards")
export class GuildLeaderboardController {
  public constructor(
    private readonly guildLeaderboardService: GuildLeaderboardService,
    private readonly guildService: GuildService,
    private readonly playerLeaderboardService: PlayerLeaderboardService
  ) {}

  @Post()
  @ApiOperation({ summary: "Get a Guild Leaderboard", tags: ["Guild Leaderboards"] })
  @ApiOkResponse({ type: PostLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 10 })
  public async getGuildLeaderboard(
    @Body() { field, page, guild, position }: GuildLeaderboardDto
  ) {
    const { input, type } = toLeaderboardQuery(guild, position, page);

    const leaderboard = await this.guildLeaderboardService.getLeaderboard(
      Guild,
      field,
      input,
      type
    );

    return leaderboard;
  }

  @Post("/members")
  @ApiOperation({
    summary: "Get a Player Leaderboard of a Guild's Members",
    tags: ["Guild Leaderboards"],
  })
  @ApiOkResponse({ type: PostLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: GuildNotFoundException })
  @Auth({ weight: 3 })
  public async getMemberLeaderboard(
    @Body() { field, guild: tag, page, player, position }: GuildMemberLeaderboardDto
  ) {
    const { input, type } = toLeaderboardQuery(player, position, page);

    const guild = await this.guildService.get(
      tag,
      GUILD_ID_REGEX.test(tag) ? GuildQuery.ID : GuildQuery.NAME,
      CacheLevel.CACHE
    );

    if (!guild) throw new GuildNotFoundException();

    return this.playerLeaderboardService.getMemberLeaderboard(guild, field, input, type);
  }

  @Post("/rankings")
  @ApiOperation({ summary: "Get a Guild Ranking", tags: ["Guild Leaderboards"] })
  @ApiOkResponse({ type: [PostLeaderboardRankingsResponse] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public async getGuildRanking(@Body() { fields, id }: GuildRankingDto) {
    return this.guildLeaderboardService.getLeaderboardRankings(Guild, fields, id);
  }
}
