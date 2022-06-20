/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ErrorResponse,
  GetHistoricalResponse,
  GetPlayerResponse,
  HistoricalType,
} from '@statsify/api-client';
import { Auth, AuthRole } from '../auth';
import { HistoricalDto } from '../dtos/historical.dto';
import { PlayerDto } from '../dtos/player.dto';
import { HistoricalService } from './historical.service';

@Controller('/historical')
@ApiTags('Historical')
export class HistoricalController {
  public constructor(private readonly historicalService: HistoricalService) {}

  @ApiOperation({ summary: 'Get the Historical stats of a Player' })
  @ApiOkResponse({ type: GetHistoricalResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get()
  @Auth({ weight: 2 })
  public async getHistoricalStats(@Query() { player: tag, type }: HistoricalDto) {
    const player = await this.historicalService.get(tag, type);

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: 'Reset the Historical stats of a Player' })
  @ApiOkResponse({ type: GetPlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Delete()
  @Auth({ role: AuthRole.MEMBER })
  public async deleteHistoricalStats(@Query() { player: tag }: PlayerDto) {
    const player = await this.historicalService.getAndReset(tag, HistoricalType.MONTHLY);

    if (!player) return { success: false };

    return { success: true, player };
  }
}
