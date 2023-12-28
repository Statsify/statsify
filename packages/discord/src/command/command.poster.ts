/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIApplicationCommand } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";
import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { parseDiscordResponse } from "#util/parse-discord-error";
import { readFile, writeFile } from "node:fs/promises";
import type { CommandResolvable } from "./command.resolvable.js";

@Service()
export class CommandPoster {
	private readonly logger = new Logger("CommandPoster");

	public constructor(private readonly rest: RestClient) {}

	public async post(command: CommandResolvable, applicationId: string, guildId?: string): Promise<APIApplicationCommand>;
	public async post(commands: Map<string, CommandResolvable>, applicationId: string, guildId?: string): Promise<APIApplicationCommand[] | null>;
	public async post(
		commands: CommandResolvable | Map<string, CommandResolvable>,
		applicationId: string,
		guildId?: string
	): Promise<APIApplicationCommand | APIApplicationCommand[] | null> {
		if (commands instanceof Map) return this.postAll(commands, applicationId, guildId);
		return this.postSingle(commands, applicationId, guildId);
	}

	public async delete(id: string, applicationId: string, guildId?: string) {
		const response = await this.rest.delete(`/applications/${applicationId}/${this.getGuildRoute(guildId)}/commands/${id}`);

		parseDiscordResponse(response);
	}

	private async postAll(commands: Map<string, CommandResolvable>, applicationId: string, guildId?: string): Promise<APIApplicationCommand[] | null> {
		const commandsToPost = [...commands.values()];

		if (!(await this.shouldPost(commands, guildId))) {
			this.logger.log("No changes to commands, skipping");
			return null;
		}

		const response = await this.rest.put(`/applications/${applicationId}/${this.getGuildRoute(guildId)}/commands`, commandsToPost);

		try {
			const cmds = parseDiscordResponse<APIApplicationCommand[]>(response);
			this.logger.log(`Successfully posted ${commandsToPost.length} commands`);
			return cmds;
		} catch (err) {
			this.logger.error("Failed to post commands");
			this.logger.error(err);
			return null;
		}
	}

	private async postSingle(command: CommandResolvable, applicationId: string, guildId?: string): Promise<APIApplicationCommand> {
		const response = await this.rest.post(`/applications/${applicationId}/${this.getGuildRoute(guildId)}/commands/`, command.toJSON());

		return parseDiscordResponse(response);
	}

	private async shouldPost(commands: Map<string, CommandResolvable>, guildId?: string) {
		const file = await readFile("./commands.json", "utf8").catch(() => null);

		await writeFile(
			"./commands.json",
			JSON.stringify({
				guildId,
				commands: Object.fromEntries(commands),
			})
		);

		if (!file) return true;

		const parsed = JSON.parse(file);

		if (parsed.guildId !== guildId) return true;

		for (const [key, value] of commands) {
			if (!parsed.commands[key]) return true;
			if (!value.equals(parsed.commands[key])) return true;
		}

		return false;
	}

	private getGuildRoute(guildId?: string) {
		return guildId ? `guilds/${guildId}` : "";
	}
}
