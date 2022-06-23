/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import { Command, CommandContext, IMessage } from "@statsify/discord";
import { PlayerArgument } from "#arguments";
import { StatusProfile } from "./status.profile";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "../../themes";
import { mapGameIdToBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.status"),
  args: [PlayerArgument],
  cooldown: 5,
})
export class StatusCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const t = context.t();
    const user = context.getUser();

    const status = await this.apiService.getStatus(context.option("player"), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(status.uuid),
      this.apiService.getUserBadge(status.uuid),
    ]);

    const background = await getBackground(
      ...mapGameIdToBackground(status.game.id ?? "LIMBO")
    );

    const canvas = render(
      <StatusProfile
        status={status}
        skin={skin}
        logo={logo}
        badge={badge}
        background={background}
        t={t}
        tier={user?.tier}
      />,
      getTheme(user?.theme)
    );

    const buffer = await canvas.toBuffer("png");

    return {
      files: [{ name: "status.png", data: buffer, type: "image/png" }],
    };
  }
}
