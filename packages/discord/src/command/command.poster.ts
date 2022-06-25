/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Logger } from "@statsify/logger";
import { parseDiscordError } from "../util/parse-discord-error";
import { readFile, writeFile } from "node:fs/promises";
import type { CommandResolvable } from "./command.resolvable";
import type { RestClient } from "tiny-discord";

export class CommandPoster {
  private readonly logger = new Logger("CommandPoster");

  public constructor(private readonly client: RestClient) {}

  public async post(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ) {
    const commandsToPost = [...commands.values()];

    if (!(await this.shouldPost(commands, guildId))) {
      this.logger.log("No changes to commands, skipping");
      return;
    }

    const res = await this.client.put(
      `/applications/${applicationId}${guildId ? `/guilds/${guildId}` : ""}/commands`,
      commandsToPost
    );

    if (res.status !== 200) {
      this.logger.error(
        `Failed to post commands with reason: ${parseDiscordError(
          (res.body as Record<string, any>)?.errors
        )}, and status: ${res.status}`
      );
    } else {
      this.logger.log(`Successfully posted ${commandsToPost.length} commands`);
    }
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
}
