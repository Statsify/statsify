import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse } from './success.response';

export class GetResourceResponse extends SuccessResponse {
  [key: string]: any;

  @ApiProperty()
  public lastUpdated: number;
}
