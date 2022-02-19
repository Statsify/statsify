import { ApiProperty } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetPlayerResponse extends SuccessResponse {
  @ApiProperty()
  public player: Player;
}
