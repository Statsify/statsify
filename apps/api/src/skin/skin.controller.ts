/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiBadRequestResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import { ErrorResponse } from "@statsify/api-client";
import { HeadDto, UuidDto } from "#dtos";
import { SkinService } from "./skin.service.js";

@Controller("/skin")
@ApiTags("Skins")
export class SkinController {
  public constructor(private readonly skinService: SkinService) {}

  @Get("/head")
  @ApiOperation({ summary: "Get a Player Head" })
  @Auth()
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getHead(@Query() { uuid, size }: HeadDto) {
    const head = await this.skinService.getHead(uuid, size);

    return new StreamableFile(head, { type: "image/png" });
  }

  @Get()
  @ApiOperation({ summary: "Get a Player Render" })
  @Auth()
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getRender(@Query() { uuid }: UuidDto) {
    const render = await this.skinService.getRender(uuid);

    return new StreamableFile(render, { type: "image/png" });
  }
}
