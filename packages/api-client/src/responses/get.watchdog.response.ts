import { ApiProperty } from '@nestjs/swagger';
import { Watchdog } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetWatchdogResponse extends SuccessResponse {
  @ApiProperty()
  public watchdog: Watchdog;
}
