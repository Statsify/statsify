/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, type IMessage } from "@statsify/discord";

@Command({ description: (t) => t("deprecated.command-description", { newCommandName: "/bedwars" }) })
export class BedWarsChallengesCommand {
  public run(): IMessage {
    return {
      content: (t) => t("deprecated.merged-dropdown", {
        oldCommandName: "`/bedwarschallenges`",
        newCommand: "</duels:1140654940658868317>",
        newCommandName: `${t("emojis:games.BEDWARS")} **BedWars**`,
        mode: "**Challenges**",
      }),
    };
  }
}
