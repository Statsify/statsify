/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller, Get, Query, Res } from "@nestjs/common";
import { ErrorResponse } from "@statsify/api-client";
import { FastifyReply } from "fastify";
import { HypixelService } from "#hypixel";
import {
  RawHypixelGamecountsResponse,
  RawHypixelGuildResponse,
  RawHypixelPlayerResponse,
  RawHypixelWatchdogStatsResponse,
} from "./responses.js";
import { RawHypixelGuildDto, RawHypixelPlayerDto } from "./dtos.js";

@Controller("/hypixel")
@ApiTags("Hypixel Proxy")
export class HypixelProxyController {
  public constructor(private readonly hypixelService: HypixelService) {}

  @Get("/player")
  @ApiOperation({
    summary: "Get a Raw Hypixel Player Response",
    description:
      "Proxies Hypixel's `/player` endpoint behind Statsify auth. `name` is resolved to a UUID before Hypixel is called. Upstream Hypixel responses, including non-2xx responses, are forwarded verbatim.",
  })
  @ApiQuery({
    name: "uuid",
    required: false,
    description: "A player's UUID. Provide exactly one of `uuid` or `name`.",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description:
      "A player's username. Statsify resolves it to a UUID through Mojang before calling Hypixel.",
  })
  @ApiOkResponse({ type: RawHypixelPlayerResponse })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: "Exactly one of `uuid` or `name` is required.",
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: "Returned locally when Mojang cannot resolve `name` to a UUID.",
  })
  @ApiBadGatewayResponse({
    type: ErrorResponse,
    description:
      "Returned locally when Statsify cannot reach Mojang or Hypixel before an upstream response exists.",
  })
  @Auth()
  public async getPlayer(@Query() query: RawHypixelPlayerDto, @Res() reply: FastifyReply) {
    const response = await this.hypixelService.getRawPlayer(query);
    return reply.status(response.status).send(response.data);
  }

  @Get("/guild")
  @ApiOperation({
    summary: "Get a Raw Hypixel Guild Response",
    description:
      "Proxies Hypixel's `/guild` endpoint behind Statsify auth. `player` usernames are resolved to UUIDs before Hypixel is called. Upstream Hypixel responses, including non-2xx responses, are forwarded verbatim.",
  })
  @ApiQuery({
    name: "id",
    required: false,
    description: "A guild id. Provide exactly one of `id`, `name`, or `player`.",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "A guild name. Provide exactly one of `id`, `name`, or `player`.",
  })
  @ApiQuery({
    name: "player",
    required: false,
    description:
      "A player's UUID or username. Usernames are resolved to UUIDs through Mojang before calling Hypixel.",
  })
  @ApiOkResponse({ type: RawHypixelGuildResponse })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: "Exactly one of `id`, `name`, or `player` is required.",
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: "Returned locally when Mojang cannot resolve `player` to a UUID.",
  })
  @ApiBadGatewayResponse({
    type: ErrorResponse,
    description:
      "Returned locally when Statsify cannot reach Mojang or Hypixel before an upstream response exists.",
  })
  @Auth({ weight: 120 })
  public async getGuild(@Query() query: RawHypixelGuildDto, @Res() reply: FastifyReply) {
    const response = await this.hypixelService.getRawGuild(query);
    return reply.status(response.status).send(response.data);
  }

  @Get("/watchdogstats")
  @ApiOperation({
    summary: "Get a Raw Hypixel Watchdog Stats Response",
    description:
      "Proxies Hypixel's `/watchdogstats` endpoint behind Statsify auth. Upstream Hypixel responses, including non-2xx responses, are forwarded verbatim.",
  })
  @ApiOkResponse({ type: RawHypixelWatchdogStatsResponse })
  @ApiBadGatewayResponse({
    type: ErrorResponse,
    description: "Returned locally when Statsify cannot reach Hypixel before an upstream response exists.",
  })
  @Auth()
  public async getWatchdogStats(@Res() reply: FastifyReply) {
    const response = await this.hypixelService.getRawWatchdogStats();
    return reply.status(response.status).send(response.data);
  }

  @Get("/gamecounts")
  @ApiOperation({
    summary: "Get a Raw Hypixel Game Counts Response",
    description:
      "Proxies Hypixel's `/gamecounts` endpoint behind Statsify auth. Upstream Hypixel responses, including non-2xx responses, are forwarded verbatim.",
  })
  @ApiOkResponse({ type: RawHypixelGamecountsResponse })
  @ApiBadGatewayResponse({
    type: ErrorResponse,
    description: "Returned locally when Statsify cannot reach Hypixel before an upstream response exists.",
  })
  @Auth()
  public async getGameCounts(@Res() reply: FastifyReply) {
    const response = await this.hypixelService.getRawGameCounts();
    return reply.status(response.status).send(response.data);
  }
}
