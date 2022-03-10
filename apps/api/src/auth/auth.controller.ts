import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { KeyDto } from '../dtos/key.dto';
import { Auth } from './auth.decorator';
import { AuthRole } from './auth.role';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('/key')
  @Auth({ role: AuthRole.ADMIN })
  @ApiExcludeEndpoint()
  public async createKey(@Body() { name }: KeyDto): Promise<string> {
    return this.authService.createKey(name);
  }
}
