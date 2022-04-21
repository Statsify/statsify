import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse } from './success.response';

//TODO add KeyData
export class GetKeyResponse extends SuccessResponse {
  @ApiProperty()
  public keyData: any;
}
