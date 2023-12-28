/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { CachedPlayerDto, PlayerDto, PlayerGroupDto, UpdatePlayerDto } from "#dtos";
import {
	DeletePlayerResponse,
	ErrorResponse,
	GetPlayerResponse,
	GetRecentGamesResponse,
	GetStatusResponse,
	PlayerNotFoundException,
	RecentGamesNotFoundException,
	StatusNotFoundException,
} from "@statsify/api-client";

import { PlayerService } from "./player.service.js";

@Controller("/player")
@ApiTags("Player")
export class PlayerController {
	public constructor(private readonly playerService: PlayerService) {}

	@ApiOperation({ summary: "Get a Player" })
	@ApiOkResponse({ type: GetPlayerResponse })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@ApiNotFoundResponse({ type: PlayerNotFoundException })
	@Auth()
	@Get()
	public async getPlayer(@Query() { player: tag, cache }: CachedPlayerDto) {
		const player = await this.playerService.get(tag, cache);

		if (!player) throw new PlayerNotFoundException();

		return {
			success: !!player,
			player,
		};
	}

	@ApiOperation({ summary: "Update a Player" })
	@Auth({ role: AuthRole.WORKER, weight: 0 })
	@Post()
	public updatePlayer(@Body() player: UpdatePlayerDto) {
		return this.playerService.update(player);
	}

	@ApiOperation({ summary: "Get a Group of Players" })
	@Auth({ role: AuthRole.WORKER, weight: 10 })
	@Get("/group")
	public getPlayerGroup(@Query() { start, end }: PlayerGroupDto) {
		return this.playerService.getPlayers(start, end);
	}

	@ApiOperation({ summary: "Deletes a Player" })
	@ApiOkResponse({ type: DeletePlayerResponse })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@Auth({ role: AuthRole.ADMIN })
	@Delete()
	public async deletePlayer(@Query() { player }: PlayerDto) {
		const deleted = await this.playerService.delete(player);

		return {
			success: !!deleted,
		};
	}

	@ApiOperation({ summary: "Get the Recent Games of a Player" })
	@ApiOkResponse({ type: GetRecentGamesResponse })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@ApiNotFoundResponse({ type: RecentGamesNotFoundException })
	@ApiNotFoundResponse({ type: PlayerNotFoundException })
	@Auth()
	@Get("/recentgames")
	public async getRecentGames(@Query() { player: tag }: PlayerDto) {
		const recentGames = await this.playerService.getRecentGames(tag);

		return {
			success: !!recentGames,
			recentGames,
		};
	}

	@ApiOperation({ summary: "Get the Status of a Player" })
	@ApiOkResponse({ type: GetStatusResponse })
	@ApiBadRequestResponse({ type: ErrorResponse })
	@ApiNotFoundResponse({ type: StatusNotFoundException })
	@ApiNotFoundResponse({ type: PlayerNotFoundException })
	@Auth({ weight: 2 })
	@Get("/status")
	public async getStatus(@Query() { player: tag }: PlayerDto) {
		const status = await this.playerService.getStatus(tag);

		return {
			success: !!status,
			status,
		};
	}
}
