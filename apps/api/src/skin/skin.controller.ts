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
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Auth } from "#auth";
import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import { ErrorResponse, GetSkinTexturesResponse, PlayerNotFoundException } from "@statsify/api-client";
import { HeadDto, KartRenderDto, PlayerDto, SkinRenderDto, WarlordsRenderDto } from "#dtos";
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
  public async getRender(@Query() { uuid, ...options }: SkinRenderDto) {
    const render = await this.skinService.getRender(uuid, false, options);
    return new StreamableFile(render, { type: "image/png" });
  }

  @Get("/extruded")
  @Auth()
  @ApiOperation({ summary: "Get an Extruded Player Render" })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getExtrudedRender(@Query() { uuid, ...options }: SkinRenderDto) {
    const render = await this.skinService.getRender(uuid, true, options);
    return new StreamableFile(render, { type: "image/png" });
  }

  @Get("/kart")
  @Auth()
  @ApiOperation({ summary: "Get a Turbo Kart Racers Kart Render, with the Player Seated in It" })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiServiceUnavailableResponse({ type: ErrorResponse })
  public async getKartRender(@Query() options: KartRenderDto) {
    const render = await this.skinService.getKartRender(options);
    return new StreamableFile(render, { type: "image/png" });
  }

  @Get("/warlords")
  @Auth()
  @ApiOperation({ summary: "Get a Warlords Render of the Player in Their Class's Helmet and Armor, Holding a Weapon, or the Weapon Alone" })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiServiceUnavailableResponse({ type: ErrorResponse })
  public async getWarlordsRender(@Query() options: WarlordsRenderDto) {
    const render = await this.skinService.getWarlordsRender(options);
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
