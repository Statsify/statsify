/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, type IMessage } from "@statsify/discord";

@Command({ description: (t) => t("deprecated.command-description", { command: "/status" }) })
export class RecentGamesCommand {
  public run(): IMessage {
    return {
      content: (t) => t("deprecated.merged-direct", {
        oldCommandName: "`/recentgames`",
        newCommandName: `${t("emojis:icons.status")} **Status**`,
        newCommand: "</status:1140654940273000550>",
      }),
    };
  }
}
