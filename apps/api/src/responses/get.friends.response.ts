import { ApiProperty } from '@nestjs/swagger';
import { Friends } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetFriendsResponse extends SuccessResponse {
  @ApiProperty()
  public friends: Friends;
}
