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
import { Auth, AuthRole } from "#auth";
import { Controller, Delete, Get, Patch, Query } from "@nestjs/common";
import {
  ErrorResponse,
  GetPlayerResponse,
  GetSessionResponse,
  SuccessResponse,
} from "@statsify/api-client";
import { PlayerDto, SessionDto, UserIdDto } from "#dtos";
import { SessionService } from "./session.service.js";

@Controller("/session")
@ApiTags("session")
export class SessionController {
  public constructor(private readonly sessionService: SessionService) {}

  @ApiOperation({ summary: "Get the Session stats of a Player" })
  @ApiOkResponse({ type: GetSessionResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get()
  @Auth({ weight: 2 })
  public async getSession(@Query() { player: tag, userUuid }: SessionDto) {
    const player = await this.sessionService.get(tag, userUuid);

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: "Reset the Session stats of a Player" })
  @ApiOkResponse({ type: GetPlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Patch()
  @Auth({ role: AuthRole.MEMBER })
  public async resetSession(
    @Query() { player: tag }: PlayerDto
  ) {
    const player = await this.sessionService.getAndReset(tag);
    return { success: !!player, player };
  }

  @ApiOperation({ summary: "Delete the Session stats of a Player" })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Delete()
  @Auth({ role: AuthRole.MEMBER })
  public async deleteSession(
    @Query() { id }: UserIdDto
  ) {
    await this.sessionService.delete(id);
    return { success: true };
  }
}
