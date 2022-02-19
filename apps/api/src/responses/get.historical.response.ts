import { ApiProperty } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetHistoricalResponse extends SuccessResponse {
  @ApiProperty()
  public oldPlayer: Player;

  @ApiProperty()
  public newPlayer: Player;

  @ApiProperty()
  public isNew: boolean;
}
