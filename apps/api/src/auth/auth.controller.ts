/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AddKeyDto, KeyHeaderDto, KeyParamDto } from "#dtos";
import { ApiExcludeEndpoint, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { Auth } from "./auth.decorator.js";
import { AuthRole } from "./auth.role.js";
import { AuthService } from "./auth.service.js";
import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";
import { GetKeyResponse } from "@statsify/api-client";

@Controller("/auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("/key")
  @Auth({ role: AuthRole.ADMIN })
  @ApiExcludeEndpoint()
  public async createKey(@Body() { name }: AddKeyDto): Promise<string> {
    return this.authService.createKey(name);
  }

  @ApiOperation({ summary: "Get the Key Information", tags: ["Auth"] })
  @Get("/key")
  @Auth()
  @ApiOkResponse({ type: GetKeyResponse })
  public async getKey(
    @Query() { key }: KeyParamDto,
    @Headers() { "x-api-key": keyHeader }: KeyHeaderDto
  ) {
    const keyData = await this.authService.getKey(key ?? keyHeader);

    return {
      success: !!keyData,
      key: keyData,
    };
  }
}
