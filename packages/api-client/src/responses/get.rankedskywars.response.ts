import { ApiProperty } from '@nestjs/swagger';
import { RankedSkyWars } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetRankedSkyWarsResponse extends SuccessResponse {
  @ApiProperty()
  public rankedSkyWars: RankedSkyWars;
}
