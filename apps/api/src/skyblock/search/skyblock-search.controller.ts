/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { Controller, Get, Query } from "@nestjs/common";
import {
  GetSkyBlockItemsResponse,
  SkyBlockUnavailableException,
} from "@statsify/api-client";
import { SkyBlockItemsDto } from "#dtos";
import { SkyBlockSearchService } from "./skyblock-search.service.js";

@Controller("/skyblock/items")
@ApiTags("SkyBlock")
export class SkyBlockSearchController {
  public constructor(private readonly searchService: SkyBlockSearchService) {}

  @ApiOperation({
    summary: "Get a Fuzzy Searched List of Priced SkyBlock Items",
  })
  @ApiOkResponse({ type: GetSkyBlockItemsResponse })
  @ApiServiceUnavailableResponse({
    type: SkyBlockUnavailableException,
    description: "market",
  })
  @Auth({ role: AuthRole.WORKER, weight: 0 })
  @Get()
  public async getItems(@Query() { query }: SkyBlockItemsDto) {
    const items = await this.searchService.get(query);

    return {
      success: true,
      items,
    };
  }
}
