/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import {
  Command,
  CommandContext,
  PaginateService,
  PlayerArgument,
} from "@statsify/discord";
import { RecentGamesProfile } from "./recentgames.profile";
import { arrayGroup } from "@statsify/util";
import { getAssetPath, getBackground, getImage, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { readdir } from "node:fs/promises";
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

    const gameIconPaths = await readdir(getAssetPath("games"));

    const gameIconsRequest = Promise.all(
      gameIconPaths.map(async (g) => [
        g.replace(".png", ""),
        await getImage(`games/${g}`),
      ])
    );

    const [logo, skin, badge, background, gameIcons] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(recentGames.uuid),
      this.apiService.getUserBadge(recentGames.uuid),
      getBackground("hypixel", "overall"),
      gameIconsRequest,
    ]);

    const gameIconsRecord = Object.fromEntries(gameIcons);

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
              tier={user?.tier}
              prefixName={recentGames.prefixName}
              gameIcons={gameIconsRecord}
            />,
            getTheme(user)
          )
      )
    );
  }
}
