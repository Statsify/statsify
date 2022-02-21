import { ApiProperty } from '@nestjs/swagger';
import { Gamecounts } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetGamecountsResponse extends SuccessResponse {
  @ApiProperty()
  public gamecounts: Gamecounts;
}
