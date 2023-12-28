/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { BadRequestException, Body, Controller, Delete, Get, Patch, Put, Query, StreamableFile } from "@nestjs/common";
import { ErrorResponse, GetUserResponse, PutUserBadgeResponse } from "@statsify/api-client";
import { UpdateUserDto, UserDto, VerifyCodeDto } from "#dtos";
import { User } from "@statsify/schemas";
import { UserService } from "./user.service.js";

@Controller("/user")
@ApiTags("User")
export class UserController {
	public constructor(private readonly userService: UserService) {}

	@Get()
	@ApiOperation({ summary: "Get a User" })
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

	@Patch()
	@ApiOperation({ summary: "Update a User" })
	@ApiOkResponse({ type: GetUserResponse })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@Auth({ role: AuthRole.ADMIN })
	public async updateUser(@Query() { tag }: UserDto, @Body() body: UpdateUserDto) {
		const user = await this.userService.update(tag, body as Partial<User>);

		return {
			success: !!user,
			user,
		};
	}

	@Get("/badge")
	@ApiOperation({ summary: "Get a User Badge" })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@Auth({ role: AuthRole.ADMIN })
	public async getUserBadge(@Query() { tag }: UserDto) {
		const badge = await this.userService.getBadge(tag);

		return new StreamableFile(badge, { type: "image/png" });
	}

	@Put("/badge")
	@ApiOkResponse({ type: PutUserBadgeResponse })
	@ApiOperation({ summary: "Set a User Badge" })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@Auth({ role: AuthRole.ADMIN })
	public async setUserBadge(@Query() { tag }: UserDto, @Body() body: Buffer) {
		await this.userService.updateBadge(tag, body);
		return { success: true };
	}

	@Delete("/badge")
	@ApiOkResponse({ type: PutUserBadgeResponse })
	@ApiOperation({ summary: "Reset a User Badge" })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@Auth({ role: AuthRole.ADMIN })
	public async deleteUserBadge(@Query() { tag }: UserDto) {
		await this.userService.deleteBadge(tag);
		return { success: true };
	}

	@Put()
	@ApiOkResponse({ type: GetUserResponse })
	@ApiOperation({ summary: "Verify a user" })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@Auth({ role: AuthRole.ADMIN })
	public async verifyUser(@Query() { code, uuid, id }: VerifyCodeDto) {
		let input: string;

		if (uuid) {
			input = uuid;
		} else if (code) {
			input = code;
		} else {
			throw new BadRequestException("No code or uuid provided");
		}

		const user = await this.userService.verifyUser(input, id);

		return {
			success: !!user,
			user,
		};
	}

	@Delete()
	@ApiOperation({ summary: "Unverify a user" })
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
