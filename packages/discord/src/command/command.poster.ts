/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Logger } from "@statsify/logger";
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

    if (!(await this.shouldPost(commandsToPost))) return;

    const res = await this.client.put(
      `/applications/${applicationId}${guildId ? `/guilds/${guildId}` : ""}/commands`,
      commandsToPost
    );

    if (res.status !== 200) {
      this.logger.error(
        `Failed to post commands with reason: ${JSON.stringify(
          (res.body as Record<string, any>)?.errors ?? {}
        )}, and status: ${res.status}`
      );
    } else {
      this.logger.log(`Successfully posted ${commandsToPost.length} commands`);
    }
  }

  private async shouldPost(commands: CommandResolvable[]) {
    const stringified = JSON.stringify(commands);

    const file = await readFile("./commands.json", "utf8").catch(() => null);

    await writeFile("./commands.json", stringified);

    if (!file) return true;

    if (stringified === file) {
      this.logger.log("No changes to commands, skipping");
      return false;
    }

    return true;
  }
}
