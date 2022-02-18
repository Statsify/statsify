import { HistoricalDto } from '#dtos/historical.dto';
import { PlayerDto } from '#dtos/player.dto';
import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { HistoricalType } from './historical-type.enum';
import { HistoricalService } from './historical.service';

@ApiTags('players')
@Controller('/historical')
export class HistoricalController {
  public constructor(private readonly historicalService: HistoricalService) {}

  @ApiOperation({ summary: 'Get the Historical stats of a Player' })
  @ApiOkResponse({ type: Player })
  @Get()
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

  @ApiOperation({ summary: 'Reset the Historical stats of a Player' })
  @ApiOkResponse({ type: Player })
  @Delete()
  public async deleteHistoricalStats(@Query() { player: tag }: PlayerDto) {
    const player = await this.historicalService.findAndReset(tag, HistoricalType.MONTHLY);

    if (!player) return { success: false };

    return { success: true, player };
  }
}
