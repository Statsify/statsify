/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, type IMessage } from "@statsify/discord";

@Command({
  description: (t) =>
    t("deprecated.command-description", { newCommandName: "/bedwars" }),
})
export class BedWarsChallengesCommand {
  public run(): IMessage {
    return {
      content: (t) =>
        t("deprecated.merged-dropdown", {
          oldCommandName: "`/bedwarschallenges`",
          newCommand: "</bedwars:1140654936544264210>",
          newCommandName: `${t("emojis:games.BEDWARS")} **BedWars**`,
          mode: "**Challenges**",
        }),
    };
  }
}
