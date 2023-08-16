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
import { EVENT_TYPES, GENERAL_MODES } from "@statsify/schemas";
import { EventsProfile } from "./events.profile.js";
import { arrayGroup } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.events"), args: [PlayerArgument] })
export class EventsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    return this.paginateService.scrollingPagination(
      context,
      arrayGroup(EVENT_TYPES, 4).map((events) => async () => {
        const background = await getBackground(
          ...mapBackground(GENERAL_MODES, GENERAL_MODES.getApiModes()[0])
        );

        return render(
          <EventsProfile
            player={player}
            skin={skin}
            background={background}
            logo={logo}
            t={t}
            user={user}
            badge={badge}
            eventNames={events}
          />,
          getTheme(user)
        );
      })
    );
  }
}
