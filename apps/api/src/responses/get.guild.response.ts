import { ApiProperty } from '@nestjs/swagger';
import { Guild } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetGuildResponse extends SuccessResponse {
  @ApiProperty()
  public guild: Guild;
}
