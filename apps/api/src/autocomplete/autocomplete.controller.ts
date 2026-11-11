/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { AutocompleteDto, AutocompleteHistoryDto, UserIdDto } from "#dtos";
import { AutocompleteService } from "./autocomplete.service.js";
import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { GetAutocompleteResponse, SuccessResponse } from "@statsify/api-client";

@Controller("/autocomplete")
@ApiTags("Autocomplete")
export class AutocompleteController {
  public constructor(private readonly autocompleteService: AutocompleteService) {}

  @ApiOperation({ summary: "Get Player or Guild Names Ranked for a Discord User" })
  @ApiOkResponse({ type: GetAutocompleteResponse })
  @Auth({ role: AuthRole.ADMIN })
  @Get()
  public async getNames(@Query() { type, id, query }: AutocompleteDto) {
    const names = await this.autocompleteService.suggest(type, id, query);

    return {
      success: true,
      names,
    };
  }

  @ApiOperation({ summary: "Record a Discord User's Player or Guild Lookup" })
  @ApiOkResponse({ type: SuccessResponse })
  @Auth({ role: AuthRole.ADMIN })
  @Post("/history")
  public async addHistory(@Body() { type, id, name }: AutocompleteHistoryDto) {
    await this.autocompleteService.record(type, id, name);
    return { success: true };
  }

  @ApiOperation({ summary: "Clear a Discord User's Lookups" })
  @ApiOkResponse({ type: SuccessResponse })
  @Auth({ role: AuthRole.ADMIN })
  @Delete("/history")
  public async clearHistory(@Query() { id }: UserIdDto) {
    await this.autocompleteService.clear(id);
    return { success: true };
  }
}
