import { ApiProperty } from '@nestjs/swagger';
import { Key } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetKeyResponse extends SuccessResponse {
  @ApiProperty()
  public key: Key;
}
