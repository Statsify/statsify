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
import { FriendsProfile } from "./friends.profile";
import { arrayGroup } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.friends"), args: [PlayerArgument] })
export class FriendsCommand {
  public constructor(
    private readonly apiSerivce: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const {
      displayName,
      friends: allFriends,
      uuid,
    } = await this.apiSerivce.getFriends(context.option("player"), user);

    const [logo, background, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      getBackground("hypixel", "overall"),
      this.apiSerivce.getPlayerSkin(uuid),
      this.apiSerivce.getUserBadge(uuid),
    ]);

    return this.paginateService.scrollingPagination(
      context,
      arrayGroup(
        allFriends.sort((a, b) => b.createdAt - a.createdAt),
        10
      ).map(
        (friends) => () =>
          render(
            <FriendsProfile
              friends={friends}
              friendCount={allFriends.length}
              skin={skin}
              logo={logo}
              badge={badge}
              background={background}
              t={t}
              tier={user?.tier}
              displayName={displayName}
            />,
            getTheme(user?.theme)
          )
      )
    );
  }
}
