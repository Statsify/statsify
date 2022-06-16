import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResourceDto {
  @IsString()
  @ApiProperty({
    example: 'games',
    description: 'The path to the resource in hypixel api',
  })
  public path: string;
}
