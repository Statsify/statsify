import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetStatusResponse extends SuccessResponse {
  @ApiProperty()
  public status: Status;
}
