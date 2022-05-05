import { ApiProperty } from '@nestjs/swagger';
import { User } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetUserResponse extends SuccessResponse {
  @ApiProperty()
  public user: User;
}
