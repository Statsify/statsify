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
  type LocalizeFunction,
  type Page,
  paginate,
  PlayerArgument,
} from "@statsify/discord";
import { FISHING_PAGES, type FishingPage, FishingProfile } from "./fishing.profile.js";
import { type FishingSeasonalYear, GENERAL_MODES } from "@statsify/schemas";
import { arrayGroup } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

const yearsLabel = (years: FishingSeasonalYear[]) =>
  years.length === 1 ? years[0].year : `${years[0].year}-${years.at(-1)!.year}`;

@Command({ description: (t) => t("commands.fishing"), args: [PlayerArgument] })
export class FishingCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const player = await this.apiService.getPlayer(context.option("player"), user);
    const { seasonal } = player.stats.general.fishing;

    const [logo, skin, badge, background] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
      getBackground(...mapBackground(GENERAL_MODES, GENERAL_MODES.getApiModes()[0])),
    ]);

    const yearGroups = arrayGroup(seasonal.toReversed(), 3);
    const pages: readonly FishingPage[] =
      yearGroups.length > 0 ? FISHING_PAGES : FISHING_PAGES.filter((page) => page !== "yearly");

    const renderPage = (t: LocalizeFunction, page: FishingPage, seasonalYears: FishingSeasonalYear[]) =>
      render(
        <FishingProfile
          player={player}
          skin={skin}
          background={background}
          logo={logo}
          t={t}
          user={user}
          badge={badge}
          time="LIVE"
          page={page}
          pageNumber={pages.indexOf(page)}
          pageCount={pages.length}
          seasonalYears={seasonalYears}
        />,
        getTheme(user)
      );

    return paginate(
      context,
      pages.map((page): Page => {
        const label = (t: LocalizeFunction) => t(`stats.fishing.pages.${page}`);

        if (page === "yearly") {
          return {
            label,
            subPages: yearGroups.map((years) => ({
              label: yearsLabel(years),
              generator: (t) => renderPage(t, page, years),
            })),
          };
        }

        return { label, generator: (t) => renderPage(t, page, []) };
      })
    );
  }
}
