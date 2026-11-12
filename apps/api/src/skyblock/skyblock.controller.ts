/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { BadRequestException, Controller, Get, NotFoundException, Query, Res, StreamableFile } from "@nestjs/common";
import { CachedPlayerDto, SkyBlockIconDto, SkyBlockItemsDto, SkyBlockPriceDto, SkyBlockProfileDto } from "#dtos";
import {
  ErrorResponse,
  GetSkyBlockItemsResponse,
  GetSkyBlockMayorResponse,
  GetSkyBlockPriceResponse,
  GetSkyBlockProfileResponse,
  GetSkyBlockProfilesResponse,
  SkyBlockNotFoundException,
  SkyBlockUnavailableException,
} from "@statsify/api-client";
import { FAILED_HEAD_SECONDS, SkyBlockIconsService } from "./skyblock-icons.service.js";
import { SkyBlockPricesService } from "./skyblock-prices.service.js";
import { SkyBlockService } from "./skyblock.service.js";
import { parseIconKey } from "@statsify/skyblock/icon-key";
import type { FastifyReply } from "fastify";

@Controller("/skyblock")
@ApiTags("SkyBlock")
export class SkyBlockController {
  public constructor(
    private readonly skyblockService: SkyBlockService,
    private readonly pricesService: SkyBlockPricesService,
    private readonly iconsService: SkyBlockIconsService
  ) {}

  @ApiOperation({
    summary: "Get a Player's SkyBlock Profiles",
    description: "When Hypixel can't be asked, the stored copy is returned with stale set and its fetchedAt.",
  })
  @ApiOkResponse({ type: GetSkyBlockProfilesResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: SkyBlockNotFoundException, description: "player or skyblock" })
  @ApiServiceUnavailableResponse({ type: SkyBlockUnavailableException })
  @Auth({ role: AuthRole.WORKER, weight: 2 })
  @Get("/profiles")
  public async getProfiles(@Query() { player, cache }: CachedPlayerDto) {
    const profiles = await this.skyblockService.getProfiles(player, cache);

    return {
      success: true,
      profiles,
    };
  }

  @ApiOperation({
    summary: "Get a SkyBlock Profile",
    description:
      "The requested sections of the player's member, computed from the stored copy of their profiles. Until the price map and items resource are built, the sections that need them are left out and listed in marketDown, and the request fails only when every one does.",
  })
  @ApiOkResponse({ type: GetSkyBlockProfileResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: SkyBlockNotFoundException, description: "player, skyblock or profile" })
  @ApiServiceUnavailableResponse({ type: SkyBlockUnavailableException })
  @Auth({ role: AuthRole.WORKER, weight: 3 })
  @Get("/profile")
  public async getProfile(@Query() { player, profile: name, sections, cache }: SkyBlockProfileDto) {
    const profile = await this.skyblockService.getProfile(player, sections, cache, name);

    return {
      success: true,
      profile,
    };
  }

  @ApiOperation({ summary: "Get What a SkyBlock Item is Worth" })
  @ApiOkResponse({ type: GetSkyBlockPriceResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: SkyBlockNotFoundException, description: "item or price" })
  @ApiServiceUnavailableResponse({ type: SkyBlockUnavailableException, description: "market" })
  @Auth({ role: AuthRole.WORKER, weight: 1 })
  @Get("/price")
  public async getPrice(@Query() { item }: SkyBlockPriceDto) {
    const price = await this.pricesService.getPrice(item);

    return {
      success: true,
      price,
    };
  }

  @ApiOperation({ summary: "Get the SkyBlock Mayor", description: "The mayor in office and their perks, from Hypixel's election resource." })
  @ApiOkResponse({ type: GetSkyBlockMayorResponse })
  @ApiServiceUnavailableResponse({ type: SkyBlockUnavailableException, description: "hypixel" })
  @Auth({ role: AuthRole.WORKER, weight: 1 })
  @Get("/mayor")
  public async getMayor() {
    const mayor = await this.pricesService.getMayor();
    if (!mayor) throw new SkyBlockUnavailableException("hypixel");

    return {
      success: true,
      mayor,
    };
  }

  /**
   * The site's item icons, which it proxies with a year's edge cache. A Steve stand-in for a head whose skin didn't load
   * is cached only as long as the failure is remembered, so the real head shows once it loads.
   */
  @Get("/icons")
  @Auth({ role: AuthRole.WORKER, weight: 0 })
  @ApiExcludeEndpoint()
  public async getIcon(@Query() { texture: key, size, glint }: SkyBlockIconDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const texture = parseIconKey(key);
    if (!texture) throw new BadRequestException("texture must be an icon key");

    const icon = await this.iconsService.getIcon(texture, size, glint === 1);
    if (!icon) throw new NotFoundException("no texture");

    reply.header("Cache-Control", icon.standIn ? `public, max-age=${FAILED_HEAD_SECONDS}` : "public, max-age=31536000, immutable");
    return new StreamableFile(icon.png, { type: "image/png" });
  }

  @ApiOperation({ summary: "Get a Fuzzy Searched List of Priced SkyBlock Items" })
  @ApiOkResponse({ type: GetSkyBlockItemsResponse })
  @ApiServiceUnavailableResponse({ type: SkyBlockUnavailableException, description: "market" })
  @Auth({ role: AuthRole.WORKER, weight: 0 })
  @Get("/items")
  public async getItems(@Query() { query }: SkyBlockItemsDto) {
    const items = await this.pricesService.searchItems(query);

    return {
      success: true,
      items,
    };
  }
}
