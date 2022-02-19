import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse {
  @ApiProperty()
  public success: boolean;
}
