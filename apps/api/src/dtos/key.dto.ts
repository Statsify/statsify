import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddKeyDto {
  @IsString()
  @ApiProperty()
  public name: string;
}

export class KeyParamDto {
  @IsString()
  @ApiProperty()
  public key: string;
}

export class KeyHeaderDto {
  @IsString()
  @ApiProperty()
  public 'x-api-key': string;
}
