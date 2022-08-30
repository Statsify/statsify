/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  Command,
  CommandContext,
  PaginateService,
  PlayerArgument,
} from "@statsify/discord";
import { RecentGamesProfile } from "./recentgames.profile.js";
import { arrayGroup } from "@statsify/util";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.recentgames"),
  args: [PlayerArgument],
  cooldown: 5,
})
export class RecentGamesCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const t = context.t();
    const user = context.getUser();

    const recentGames = await this.apiService.getRecentGames(
      context.option("player"),
      user
    );

    const [logo, skin, badge, background, gameIcons] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(recentGames.uuid),
      this.apiService.getUserBadge(recentGames.uuid),
      getBackground("hypixel", "overall"),
      getAllGameIcons(),
    ]);

    return this.paginateService.scrollingPagination(
      context,
      arrayGroup(recentGames.games, 9).map(
        (games) => () =>
          render(
            <RecentGamesProfile
              recentGames={games}
              skin={skin}
              logo={logo}
              badge={badge}
              background={background}
              t={t}
              user={user}
              prefixName={recentGames.prefixName}
              gameIcons={gameIcons}
            />,
            getTheme(user)
          )
      )
    );
  }
}
