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
import { arrayGroup } from "@statsify/util";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";
import type { FishingPageData } from "./fishing.profile.js";
import type { LocalizeFunction, Page } from "@statsify/discord";
import type { FishingSeasonalYear } from "@statsify/schemas";

const seasonalPageLabel = (years: FishingSeasonalYear[]) =>
  years.length === 1
    ? years[0].year
    : `${years[0].year}-${years.at(-1)!.year}`;

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

    const seasonalPages = arrayGroup(
      fishing.seasonal.years.filter((year) => year.total > 0).reverse(),
      3,
    ).map((years) => ({
      label: seasonalPageLabel(years),
      seasonalYears: years,
    }));

    const pages: FishingPageData[] = [
      { id: "overview", label: "Overview" },
      { id: "mythicals", label: "Mythicals" },
      { id: "specialsOne", label: "Special Fish I" },
      { id: "specialsTwo", label: "Special Fish II" },
      { id: "collections", label: "Collections" },
      { id: "catchesOne", label: "Catches I" },
      { id: "catchesTwo", label: "Catches II" },
      ...(seasonalPages.length > 0
        ? [{ id: "seasonal" as const, label: "Seasonal" }]
        : []),
    ];

    const renderPage = async (
      t: LocalizeFunction,
      pageData: FishingPageData,
      page: number,
      seasonalYears = pageData.seasonalYears,
    ) => {
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
          seasonalYears={seasonalYears}
        />,
        getTheme(user),
      );
    };

    return paginate(
      context,
      pages.map((pageData, page): Page => {
        if (pageData.id === "seasonal") {
          return {
            label: pageData.label,
            subPages: seasonalPages.map(({ label, seasonalYears }) => ({
              label,
              generator: (t) => renderPage(t, pageData, page, seasonalYears),
            })),
          };
        }

        return {
          label: pageData.label,
          generator: (t) => renderPage(t, pageData, page),
        };
      }),
    );
  }
}
