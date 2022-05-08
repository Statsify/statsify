import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty()
  public statusCode: number;

  @ApiProperty({ type: [String] })
  public message: string[];

  @ApiProperty()
  public error: string;
}
