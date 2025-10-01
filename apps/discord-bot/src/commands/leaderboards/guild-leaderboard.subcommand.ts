/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, CommandContext, SubCommand } from "@statsify/discord";
import { BaseLeaderboardCommand } from "./base.leaderboard-command.js";
import { GuildLeaderboardArgument } from "./guild-leaderboard.argument.js";
import { Service } from "typedi";
import { getBackground } from "@statsify/assets";
import { getTheme } from "#themes";

@Service()
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
    const user = context.getUser();

    const field = leaderboard.replace(/ /g, ".");
    const theme = getTheme(user);
    const background = await getBackground("hypixel", "overall", theme?.context.boxColorId ?? "orange");

    return this.createLeaderboard({
      context,
      theme,
      background,
      field,
      getLeaderboard: this.apiService.getGuildLeaderboard.bind(this.apiService),
      type: "guild",
    });
  }
}
