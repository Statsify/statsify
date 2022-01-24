import { HeadDto } from '#dtos/head.dto';
import { Controller, Get, Query, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkinService } from './skin.service';

@ApiTags('skins')
@Controller('/skin')
export class SkinController {
  public constructor(private readonly skinService: SkinService) {}

  @Get('/head')
  @ApiOperation({ summary: 'Get a Player Head' })
  public async getHead(@Query() { uuid, size }: HeadDto) {
    const head = await this.skinService.getHead(uuid, size);

    return new StreamableFile(head, { type: 'image/png' });
  }
}
