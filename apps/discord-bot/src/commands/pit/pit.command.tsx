/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, PitPandaService } from "#services";
import {
  Command,
  CommandContext,
  PaginateService,
  PlayerArgument,
} from "@statsify/discord";
import { PIT_MODES } from "@statsify/schemas";
import { PitProfile } from "./pit.profile";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.pit"), args: [PlayerArgument] })
export class PitCommand {
  public constructor(
    private readonly pitPandaService: PitPandaService,
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const player = await this.pitPandaService.getPlayer(
      context.option<string>("player"),
      user
    );

    const [skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
      getLogo(user?.tier),
      getBackground(...mapBackground(PIT_MODES, "overall")),
    ]);

    const canvas = render(
      <PitProfile
        player={player}
        background={background}
        logo={logo}
        skin={skin}
        t={t}
        tier={user?.tier}
        badge={badge}
      />,
      getTheme(user)
    );

    return this.paginateService.paginate(context, [
      {
        label: "Overall",
        generator: () => canvas,
      },
    ]);
  }
}
