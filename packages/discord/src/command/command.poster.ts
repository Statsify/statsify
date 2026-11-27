/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { API } from "@discordjs/core/http-only";
import { APIApplicationCommand, Routes } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";
import { Service } from "typedi";
import { readFile, writeFile } from "node:fs/promises";
import type { CommandResolvable } from "./command.resolvable.js";

@Service()
export class CommandPoster {
  private readonly logger = new Logger("CommandPoster");

  public constructor(private readonly api: API) {}

  public async post(
    command: CommandResolvable,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand>;
  public async post(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand[] | null>;
  public async post(
    commands: CommandResolvable | Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand | APIApplicationCommand[] | null> {
    if (commands instanceof Map) return this.postAll(commands, applicationId, guildId);
    return this.postSingle(commands, applicationId, guildId);
  }

  public async delete(id: string, applicationId: string, guildId?: string) {
    await this.api.rest.delete(`${this.getCommandsRoute(applicationId, guildId)}/${id}`);
  }

  private async postAll(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand[] | null> {
    const commandsToPost = [...commands.values()];

    if (!(await this.shouldPost(commands, guildId))) {
      this.logger.log("No changes to commands, skipping");
      return null;
    }

    let cmds: APIApplicationCommand[];

    try {
      cmds = (await this.api.rest.put(this.getCommandsRoute(applicationId, guildId), {
        body: commandsToPost,
      })) as APIApplicationCommand[];
    } catch (err) {
      this.logger.error("Failed to post commands");
      this.logger.error(err);
      return null;
    }

    await writeFile(
      "./commands.json",
      JSON.stringify({
        guildId,
        commands: Object.fromEntries(commands),
      })
    );

    this.logger.log(`Successfully posted ${commandsToPost.length} commands`);
    return cmds;
  }

  private async postSingle(
    command: CommandResolvable,
    applicationId: string,
    guildId?: string
  ): Promise<APIApplicationCommand> {
    return this.api.rest.post(this.getCommandsRoute(applicationId, guildId), {
      body: command.toJSON(),
    }) as Promise<APIApplicationCommand>;
  }

  private async shouldPost(commands: Map<string, CommandResolvable>, guildId?: string) {
    const file = await readFile("./commands.json", "utf8").catch(() => null);
    if (!file) return true;

    const parsed = JSON.parse(file);

    if (parsed.guildId !== guildId || Object.keys(parsed.commands).length !== commands.size) {
      return true;
    }

    for (const [key, value] of commands) {
      if (!parsed.commands[key] || !value.equals(parsed.commands[key])) {
        return true;
      }
    }

    return false;
  }

  private getCommandsRoute(applicationId: string, guildId?: string) {
    return guildId ?
      Routes.applicationGuildCommands(applicationId, guildId) :
      Routes.applicationCommands(applicationId);
  }
}
