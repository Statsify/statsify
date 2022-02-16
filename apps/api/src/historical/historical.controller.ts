import { HistoricalDto } from '#dtos/historical.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
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
}
