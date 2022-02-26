import { Controller, Get, Query, StreamableFile } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';
import { HeadDto } from '../dtos';
import { ErrorResponse } from '../responses';
import { SkinService } from './skin.service';

@Controller('/skin')
export class SkinController {
  public constructor(private readonly skinService: SkinService) {}

  @Get('/head')
  @ApiOperation({ summary: 'Get a Player Head' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getHead(@Query() { uuid, size }: HeadDto) {
    const head = await this.skinService.getHead(uuid, size);

    return new StreamableFile(head, { type: 'image/png' });
  }
}
