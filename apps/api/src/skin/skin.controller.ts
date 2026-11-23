/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { Controller, Get, Query, Res, StreamableFile } from "@nestjs/common";
import { ErrorResponse, GetSkinTexturesResponse, PlayerNotFoundException } from "@statsify/api-client";
import { HeadDto, PlayerDto, UuidDto } from "#dtos";
import { SkinService } from "./skin.service.js";
import type { FastifyReply } from "fastify";

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

  /** The site's heads, from the stored skin only: the site refreshes skins within its Hypixel budget instead. */
  @Get("/head/stored")
  @Auth({ role: AuthRole.SITE, siteUnlimited: true })
  @ApiExcludeEndpoint()
  public async getStoredHead(@Query() { uuid, size }: HeadDto) {
    const head = await this.skinService.getStoredHead(uuid, size);
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

  /** The site's renders, from the stored skin only, like `/head/stored`. */
  @Get("/stored")
  @Auth({ role: AuthRole.SITE, siteUnlimited: true })
  @ApiExcludeEndpoint()
  public async getStoredRender(@Query() { uuid }: UuidDto) {
    const render = await this.skinService.getStoredRender(uuid);
    return new StreamableFile(render, { type: "image/png" });
  }

  /**
   * The site's skin viewer: the stored skin's texture, like `/head/stored`, and in `X-Skin-Model` its arm width, which
   * the texture doesn't carry.
   */
  @Get("/texture")
  @Auth({ role: AuthRole.SITE, siteUnlimited: true })
  @ApiExcludeEndpoint()
  public async getTexture(@Query() { uuid }: UuidDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const { texture, slim } = await this.skinService.getStoredTexture(uuid);
    reply.header("X-Skin-Model", slim ? "slim" : "classic");
    return new StreamableFile(texture, { type: "image/png" });
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
