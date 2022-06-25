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
import { ErrorMessage } from "#lib/error.message";
import { Mutual, MutualsProfile } from "./mutuals.profile";
import { arrayGroup } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.mutuals"),
  args: [new PlayerArgument("player1", true), new PlayerArgument("player2", false)],
})
export class MutualsCommand {
  public constructor(
    private readonly apiSerivce: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const {
      displayName: displayNameOne,
      friends: friendsOne,
      uuid: uuidOne,
    } = await this.apiSerivce.getFriends(context.option("player1"));

    const {
      displayName: displayNameTwo,
      friends: friendsTwo,
      uuid: uuidTwo,
    } = await this.apiSerivce.getFriends(context.option("player2"), user);

    const mutuals: Mutual[] = [];

    for (const friendOne of friendsOne) {
      const friendTwo = friendsTwo.find((f) => f.uuid === friendOne.uuid);
      if (!friendTwo) continue;

      mutuals.push({
        displayName: friendOne.displayName,
        uuid: friendOne.uuid,
        createdAtOne: friendOne.createdAt,
        createdAtTwo: friendTwo.createdAt,
      });
    }

    if (mutuals.length === 0) {
      throw new ErrorMessage(
        (t) => t("errors.noMutuals.title"),
        (t) =>
          t("errors.noMutuals.description", {
            displayNameOne: this.apiSerivce.emojiDisplayName(t, displayNameOne),
            displayNameTwo: this.apiSerivce.emojiDisplayName(t, displayNameTwo),
          })
      );
    }

    const [logo, background, skinOne, skinTwo, badgeOne, badgeTwo] = await Promise.all([
      getLogo(user?.tier),
      getBackground("hypixel", "overall"),
      this.apiSerivce.getPlayerSkin(uuidOne),
      this.apiSerivce.getPlayerSkin(uuidTwo),
      this.apiSerivce.getUserBadge(uuidOne),
      this.apiSerivce.getUserBadge(uuidTwo),
    ]);

    return this.paginateService.scrollingPagination(
      context,
      arrayGroup(
        mutuals.sort((a, b) => b.createdAtOne - a.createdAtOne),
        10
      ).map(
        (friends) => () =>
          render(
            <MutualsProfile
              friends={friends}
              friendCount={mutuals.length}
              skinOne={skinOne}
              skinTwo={skinTwo}
              badgeOne={badgeOne}
              badgeTwo={badgeTwo}
              displayNameOne={displayNameOne}
              displayNameTwo={displayNameTwo}
              background={background}
              logo={logo}
              t={t}
              tier={user?.tier}
            />,
            getTheme(user?.theme)
          )
      )
    );
  }
}
