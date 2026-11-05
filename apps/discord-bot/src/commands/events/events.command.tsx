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
  scrollingPagination,
  PlayerArgument,
} from "@statsify/discord";
import { EVENT_TYPES, GENERAL_MODES } from "@statsify/schemas";
import { EventsProfile } from "./events.profile.js";
import { all } from "better-all";
import { arrayGroup } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.events"), args: [PlayerArgument] })
export class EventsCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();
    const tag = context.option<string>("player");

    const selfUuid = tag ? undefined : user?.uuid;
    const { apiService } = this;

    const { player, logo, skin, badge } = await all({
      player: () => apiService.getPlayer(tag, user),
      logo: () => getLogo(user),
      async skin() {
        return apiService.getPlayerSkin(selfUuid ?? (await this.$.player).uuid, user);
      },
      async badge() {
        return apiService.getUserBadge(selfUuid ?? (await this.$.player).uuid);
      },
    });

    return scrollingPagination(
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
