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
  PlayerArgument,
  paginate,
} from "@statsify/discord";
import { FishingProfile } from "./fishing.profile.js";
import { GENERAL_MODES } from "@statsify/schemas";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";
import type { FishingPageData } from "./fishing.profile.js";
import type { Page } from "@statsify/discord";

@Command({ description: (t) => t("commands.fishing"), args: [PlayerArgument] })
export class FishingCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const player = await this.apiService.getPlayer(
      context.option("player"),
      user,
    );
    const fishing = player.stats.general.fishing;

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const pages: FishingPageData[] = [
      { id: "overview", label: "Overview" },
      { id: "mythicals", label: "Mythicals" },
      { id: "specialsOne", label: "Special Fish I" },
      { id: "specialsTwo", label: "Special Fish II" },
      { id: "collections", label: "Collections" },
    ];

    if (fishing.seasonal.hasData) {
      pages.push({ id: "seasonal", label: "Seasonal" });
    }

    return paginate(
      context,
      pages.map(
        (pageData, page): Page => ({
          label: pageData.label,
          generator: async (t) => {
            const background = await getBackground(
              ...mapBackground(GENERAL_MODES, GENERAL_MODES.getApiModes()[0]),
            );

            return render(
              <FishingProfile
                player={player}
                skin={skin}
                background={background}
                logo={logo}
                t={t}
                user={user}
                badge={badge}
                time="LIVE"
                page={pageData.id}
                pageNumber={page}
                pageCount={pages.length}
              />,
              getTheme(user),
            );
          },
        }),
      ),
    );
  }
}
