import { Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponse, GetUserResponse } from '@statsify/api-client';
import { Auth, AuthRole } from '../auth';
import { UserDto, VerifyCodeDto } from '../dtos';
import { UserService } from './user.service';

@Controller('/user')
@ApiTags('User')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get a User' })
  @ApiOkResponse({ type: GetUserResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  public async getUser(@Query() { tag }: UserDto) {
    const user = await this.userService.get(tag);

    return {
      success: !!user,
      user,
    };
  }

  @Put()
  @ApiOkResponse({ type: GetUserResponse })
  @ApiOperation({ summary: 'Verify a user' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  public async verifyUser(@Query() { code, id }: VerifyCodeDto) {
    const user = await this.userService.verifyUser(code, id);

    return {
      success: !!user,
      user,
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Unverify a user' })
  @ApiOkResponse({ type: GetUserResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  public async unverifyUser(@Query() { tag }: UserDto) {
    const user = await this.userService.unverifyUser(tag);

    return {
      success: !!user,
      user,
    };
  }
}
