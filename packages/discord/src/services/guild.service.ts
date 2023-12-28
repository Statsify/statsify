/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIGuild } from "discord-api-types/v10";
import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { parseDiscordResponse } from "#util/parse-discord-error";

@Service()
export class GuildService {
	public constructor(private readonly rest: RestClient) {}

	public async get(guildId: string): Promise<APIGuild> {
		const response = await this.rest.get(`/guilds/${guildId}?with_counts=true`);
		return parseDiscordResponse(response);
	}
}
