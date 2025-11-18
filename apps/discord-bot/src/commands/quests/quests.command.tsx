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
  Page,
  PaginateService,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { QUEST_MODES, QuestTime } from "@statsify/schemas";
import { QuestProfileProps, QuestsProfile } from "./quests.profile.js";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.quests") })
export class QuestsCommand {
  private readonly modes = QUEST_MODES;

  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({
    description: (t) => t("commands.quests-overall"),
    args: [PlayerArgument],
  })
  public async overall(context: CommandContext) {
    return this.run(context, QuestTime.Overall);
  }

  @SubCommand({
    description: (t) => t("commands.quests-monthly"),
    args: [PlayerArgument],
  })
  public async monthly(context: CommandContext) {
    return this.run(context, QuestTime.Monthly);
  }

  @SubCommand({
    description: (t) => t("commands.quests-weekly"),
    args: [PlayerArgument],
  })
  public async weekly(context: CommandContext) {
    return this.run(context, QuestTime.Weekly);
  }

  @SubCommand({
    description: (t) => t("commands.quests-daily"),
    args: [PlayerArgument],
  })
  public async daily(context: CommandContext) {
    return this.run(context, QuestTime.Daily);
  }

  private getProfile(props: QuestProfileProps): JSX.Element {
    return <QuestsProfile {...props} />;
  }

  private async run(context: CommandContext, time: QuestTime) {
    const user = context.getUser();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, skin, badge, gameIcons, verifiedLogo, crossLogo] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
      getAllGameIcons(),
      getLogo("verified", 28),
      getLogo("cross", 28),
    ]);

    const { quests } = player.stats;
    let modes = this.modes.getModes();

    // Currently only SkyWars has a monthly quest so it is useless to show other modes
    if (time == QuestTime.Monthly) {
      // Filter for objects with more than 1 field (the total field)
      modes = modes.filter((mode) => mode.api === "overall" || Object.entries(quests.monthly[mode.api]).length > 1);
    }

    const pages: Page[] = modes
      .map((mode) => ({
        label: mode.formatted,
        emoji: mode.api !== "overall" && ((t) => t(`emojis:games.${mode.api}`)),
        generator: async (t) => {
          const background = await getBackground(...mapBackground(this.modes, mode.api));

          const profile = this.getProfile({
            player,
            skin,
            background,
            logo,
            t,
            user,
            badge,
            time,
            mode: { ...mode, submode: undefined },
            gameIcons,
            logos: [crossLogo, verifiedLogo],
          });

          return render(profile, getTheme(user));
        },
      }));

    return this.paginateService.paginate(context, pages);
  }
}
