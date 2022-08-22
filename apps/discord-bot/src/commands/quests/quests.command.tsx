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
import { GameModes, QUEST_MODES, QuestModes, QuestTime } from "@statsify/schemas";
import { QuestProfileProps, QuestsProfile } from "./quests.profile";
import { getAllGameIcons, getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { render } from "@statsify/rendering";

@Command({ description: (t) => t("commands.quests") })
export class QuestsCommand {
  private readonly modes: GameModes<QuestModes> = QUEST_MODES;

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
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
      getAllGameIcons(),
      getLogo("verified", 28),
      getLogo("cross", 28),
    ]);

    const pages: Page[] = this.modes.getModes().map((mode) => ({
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
          mode,
          gameIcons,
          logos: [crossLogo, verifiedLogo],
        });

        return render(profile, getTheme(user));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }
}
