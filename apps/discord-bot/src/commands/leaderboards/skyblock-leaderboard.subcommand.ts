/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, CommandContext } from "@statsify/discord";
import { BaseLeaderboardCommand } from "./base.leaderboard-command.js";
import { Service } from "typedi";
import { getBackground } from "@statsify/assets";

/** `/leaderboard skyblock` and `/skyblock leaderboard`: a row is one member of a profile, `<uuid>:<profile id>`. */
@Service()
export class SkyBlockLeaderboardSubCommand extends BaseLeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {
    super();
  }

  public async leaderboard(context: CommandContext) {
    const field = context.option<string>("leaderboard").replaceAll(" ", ".");
    const background = await getBackground("hypixel", "overall");

    return this.createLeaderboard({
      context,
      background,
      field,
      getLeaderboard: this.apiService.getSkyBlockLeaderboard.bind(this.apiService),
      type: "player",
      getLeaderboardDataIcon: (id) => this.apiService.getPlayerHead(id.split(":")[0], 24),
    });
  }
}
