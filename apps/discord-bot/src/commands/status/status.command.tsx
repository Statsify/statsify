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
  IMessage,
  PlayerArgument,
} from "@statsify/discord";
import { StatusProfile } from "./status.profile.js";
import { all } from "better-all";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapGameIdToBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.status"),
  args: [PlayerArgument],
  cooldown: 10,
})
export class StatusCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const t = context.t();
    const user = context.getUser();
    const tag = context.option<string>("player");

    const selfUuid = tag ? undefined : user?.uuid;
    const { apiService } = this;

    const { status, logo, skin, badge, background, gameIcons } = await all({
      status: () => apiService.getStatus(tag, user),
      logo: () => getLogo(user),
      async skin() {
        return apiService.getPlayerSkin(selfUuid ?? (await this.$.status).uuid, user);
      },
      async badge() {
        return apiService.getUserBadge(selfUuid ?? (await this.$.status).uuid);
      },
      async background() {
        return getBackground(...mapGameIdToBackground((await this.$.status).game.id ?? "LIMBO"));
      },
      gameIcons: () => getAllGameIcons(),
    });

    const canvas = render(
      <StatusProfile
        status={status}
        gameIcons={gameIcons}
        skin={skin}
        logo={logo}
        badge={badge}
        background={background}
        t={t}
        user={user}
      />,
      getTheme(user)
    );

    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ name: "status.png", data: buffer, type: "image/png" }],
    };
  }
}
