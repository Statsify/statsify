/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import { BaseLeaderboardCommand } from "./base.leaderboard-command";
import { CommandContext, SubCommand } from "@statsify/discord";
import { GuildLeaderboardArgument } from "#arguments";
import { getBackground } from "@statsify/assets";

export class GuildLeaderboardSubCommand extends BaseLeaderboardCommand {
  public constructor(protected readonly apiService: ApiService) {
    super();
  }

  @SubCommand({
    description: (t) => t("commands.guild-leaderboard"),
    args: [GuildLeaderboardArgument],
  })
  public async leaderboard(context: CommandContext) {
    const leaderboard = context.option<string>("leaderboard");

    const field = leaderboard.replaceAll(" ", ".");
    const background = await getBackground("hypixel", "overall");

    return this.createLeaderboard({
      context,
      background,
      field,
      getLeaderboard: this.apiService.getGuildLeaderboard.bind(this.apiService),
      type: "guild",
    });
  }
}
