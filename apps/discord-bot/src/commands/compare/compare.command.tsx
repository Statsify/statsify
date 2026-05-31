/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiModeFromGameModes,
  BEDWARS_MODES,
  BedWarsModes,
  FormattedGame,
  type GameModeWithSubModes,
  type GameModes,
  type Player,
} from "@statsify/schemas";
import {
  ApiService,
  Command,
  CommandContext,
  type LocalizeFunction,
  Page,
  PaginateService,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { CompareProfile } from "./compare.profile.js";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { StatColumn } from "#components";
import { getBackground, getLogo } from "@statsify/assets";
import { getBedWarsTable } from "../bedwars/bedwars.profile.js";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

const args = [new PlayerArgument("player", true), new PlayerArgument("player2", false)];

@Command({ description: (t) => t("commands.compare") })
export class CompareCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t("commands.compare-bedwars"), args })
  public bedwars(context: CommandContext) {
    return this.run(
      context,
      BEDWARS_MODES,
      (player, modeApi, t) =>
        getBedWarsTable(
          player.stats.bedwars[modeApi as ApiModeFromGameModes<BedWarsModes>],
          t
        ),
      (t, mode) => `§l${FormattedGame.BEDWARS} §fCompare §r(${mode.formatted})`
    );
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    modes: GameModes<T>,
    getTable: (player: Player, modeApi: string, t: LocalizeFunction) => StatColumn[][],
    getTitle: (t: LocalizeFunction, mode: GameModeWithSubModes<T>) => string
  ) {
    const user = context.getUser();

    const [player, player2] = await Promise.all([
      this.apiService.getPlayer(context.option("player", ""), user),
      this.apiService.getPlayer(context.option("player2", ""), user),
    ]);

    const logo = await getLogo(user);
    const allModes = modes.getModes();

    const pages: Page[] = allModes.map((mode) => ({
      label: mode.formatted,
      generator: async (t) => {
        const bg = await getBackground(...mapBackground(modes, mode.api));
        const table1 = getTable(player, mode.api, t);
        const table2 = getTable(player2, mode.api, t);

        const profile = (
          <CompareProfile
            player={player}
            player2={player2}
            background={bg}
            logo={logo}
            user={user}
            t={t}
            table1={table1}
            table2={table2}
            title={getTitle(t, mode)}
          />
        );

        return render(profile, getTheme(user));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }
}
