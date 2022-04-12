import { Controller, Get, Query, StreamableFile } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth';
import { HeadDto } from '../dtos';
import { UuidDto } from '../dtos/uuid.dto';
import { ErrorResponse } from '../responses';
import { SkinService } from './skin.service';

@Controller('/skin')
export class SkinController {
  public constructor(private readonly skinService: SkinService) {}

  @Get('/head')
  @ApiOperation({ summary: 'Get a Player Head', tags: ['Skins'] })
  @Auth()
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getHead(@Query() { uuid, size }: HeadDto) {
    const head = await this.skinService.getHead(uuid, size);

    return new StreamableFile(head, { type: 'image/png' });
  }

  @Get()
  @ApiOperation({ summary: 'Get a Player Render', tags: ['Skins'] })
  @Auth()
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getRender(@Query() { uuid }: UuidDto) {
    const render = await this.skinService.getRender(uuid);

    return new StreamableFile(render, { type: 'image/png' });
  }
}
