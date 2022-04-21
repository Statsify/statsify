import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ErrorResponse, GetHistoricalResponse, GetPlayerResponse } from '@statsify/api-client';
import { Auth, AuthRole } from '../auth';
import { HistoricalDto } from '../dtos';
import { PlayerDto } from '../dtos/player.dto';
import { HistoricalType } from './historical-type.enum';
import { HistoricalService } from './historical.service';

@Controller('/historical')
export class HistoricalController {
  public constructor(private readonly historicalService: HistoricalService) {}

  @ApiOperation({ summary: 'Get the Historical stats of a Player', tags: ['Historical'] })
  @ApiOkResponse({ type: GetHistoricalResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get()
  @Auth({ weight: 2 })
  public async getHistoricalStats(@Query() { player: tag, type }: HistoricalDto) {
    const [newPlayer, oldPlayer, isNew] = await this.historicalService.findOne(tag, type);

    if (!newPlayer)
      return {
        success: false,
        oldPlayer: null,
        newPlayer: null,
      };

    return {
      success: true,
      oldPlayer,
      newPlayer,
      isNew,
    };
  }

  @ApiOperation({ summary: 'Reset the Historical stats of a Player', tags: ['Historical'] })
  @ApiOkResponse({ type: GetPlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Delete()
  @Auth({ role: AuthRole.MEMBER })
  public async deleteHistoricalStats(@Query() { player: tag }: PlayerDto) {
    const player = await this.historicalService.findAndReset(tag, HistoricalType.MONTHLY);

    if (!player) return { success: false };

    return { success: true, player };
  }
}
