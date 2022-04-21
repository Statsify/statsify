import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AddKeyDto, KeyHeaderDto, KeyParamDto } from '../dtos/key.dto';
import { Auth } from './auth.decorator';
import { AuthRole } from './auth.role';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('/key')
  @Auth({ role: AuthRole.ADMIN })
  @ApiExcludeEndpoint()
  public async createKey(@Body() { name }: AddKeyDto): Promise<string> {
    return this.authService.createKey(name);
  }

  @Get('/key')
  @Auth()
  public async getKey(
    @Query() { key }: KeyParamDto,
    @Headers() { 'x-api-key': keyHeader }: KeyHeaderDto
  ) {
    const keyData = await this.authService.getKey(key ?? keyHeader);

    return {
      success: !!keyData,
      key: keyData,
    };
  }
}
