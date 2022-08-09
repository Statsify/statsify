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

import Container from "typedi";
import { GameId, GameModes, QUEST_MODES, QuestModes } from "@statsify/schemas";
import { Image } from "skia-canvas";
import { QuestProfileProps, QuestsProfile } from "./quests.profile";
import { getAllGameIcons, getBackground, getImage, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

interface PreProfileData {
  gameIcons: Record<GameId, Image>;
}

@Command({ description: (t) => t("commands.challenges") })
export class QuestsCommand {
  protected readonly apiService: ApiService;
  protected readonly paginateService: PaginateService;
  protected readonly modes: GameModes<QuestModes> = QUEST_MODES;

  public constructor() {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

  @SubCommand({
    description: (t) => t("commands.quests-overall"),
    args: [new PlayerArgument()],
  })
  public async overall(context: CommandContext) {
    return this.run(context, "overall");
  }

  @SubCommand({
    description: (t) => t("commands.quests-daily"),
    args: [new PlayerArgument()],
  })
  public async daily(context: CommandContext) {
    return this.run(context, "daily");
  }

  @SubCommand({
    description: (t) => t("commands.quests-weekly"),
    args: [new PlayerArgument()],
  })
  public async weekly(context: CommandContext) {
    return this.run(context, "weekly");
  }

  private async getPreProfileData(): Promise<PreProfileData> {
    return { gameIcons: await getAllGameIcons() };
  }

  private getProfile(props: QuestProfileProps): JSX.Element {
    return <QuestsProfile {...props} />;
  }

  private async run(context: CommandContext, time: "overall" | "daily" | "weekly") {
    const user = context.getUser();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, skin, badge, gameIcons, verifiedLogo, crossLogo] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
      getAllGameIcons(),
      getImage("logos/verified_logo_30.png"),
      getImage("logos/cross_logo_30.png"),
    ]);

    const allModes = this.modes.getModes();

    const pages: Page[] = allModes.map((mode) => ({
      label: mode.formatted,
      generator: async (t) => {
        const background = await getBackground("hypixel", "overall");

        const profile = this.getProfile({
          player,
          skin,
          background,
          logo,
          t,
          user,
          badge,
          time: "LIVE",
          mode,
          gameIcons,
          questTimePeriod: time,
          logos: [crossLogo, verifiedLogo],
        });

        return render(profile, getTheme(user));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }
}
