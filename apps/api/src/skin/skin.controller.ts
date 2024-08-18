/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import { ErrorResponse, GetSkinTexturesResponse, PlayerNotFoundException } from "@statsify/api-client";
import { HeadDto, PlayerDto, UuidDto } from "#dtos";
import { SkinService } from "./skin.service.js";

@Controller("/skin")
@ApiTags("Skins")
export class SkinController {
  public constructor(private readonly skinService: SkinService) {}

  @Get("/head")
  @Auth()
  @ApiOperation({ summary: "Get a Player Head" })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getHead(@Query() { uuid, size }: HeadDto) {
    const head = await this.skinService.getHead(uuid, size);

    return new StreamableFile(head, { type: "image/png" });
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: "Get a Player Render" })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getRender(@Query() { uuid }: UuidDto) {
    const render = await this.skinService.getRender(uuid, false);
    return new StreamableFile(render, { type: "image/png" });
  }

  @Get("/extruded")
  @Auth()
  @ApiOperation({ summary: "Get an Extruded Player Render" })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getExtrudedRender(@Query() { uuid }: UuidDto) {
    const render = await this.skinService.getRender(uuid, true);
    return new StreamableFile(render, { type: "image/png" });
  }

  @Get("/textures")
  @Auth()
  @ApiOperation({ summary: "Get a Player's Texture Information" })
  @ApiOkResponse({ type: GetSkinTexturesResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: PlayerNotFoundException })
  public async getTextures(@Query() { player }: PlayerDto) {
    const skin = await this.skinService.getSkin(player);
    return { success: !!skin, skin };
  }
}
