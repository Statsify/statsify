import { ApiProperty } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetHistoricalResponse extends SuccessResponse {
  @ApiProperty()
  public player: Player;
}
