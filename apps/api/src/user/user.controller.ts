import { Body, Controller, Delete, Get, Put, Query, StreamableFile } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponse, GetUserResponse, PutUserBadgeResponse } from '@statsify/api-client';
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

  @Get(`/badge`)
  @ApiOperation({ summary: 'Get a User Badge' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  public async getUserBadge(@Query() { tag }: UserDto) {
    const badge = await this.userService.getBadge(tag);

    return new StreamableFile(badge, { type: 'image/png' });
  }

  @Put(`/badge`)
  @ApiOkResponse({ type: PutUserBadgeResponse })
  @ApiOperation({ summary: 'Set a User Badge' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  public async setUserBadge(@Query() { tag }: UserDto, @Body() body: Buffer) {
    await this.userService.updateBadge(tag, body);
    return { success: true };
  }

  @Delete(`/badge`)
  @ApiOkResponse({ type: PutUserBadgeResponse })
  @ApiOperation({ summary: 'Reset a User Badge' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  public async deleteUserBadge(@Query() { tag }: UserDto) {
    await this.userService.deleteBadge(tag);
    return { success: true };
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
