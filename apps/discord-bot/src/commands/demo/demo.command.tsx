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
import { Container } from "typedi";
import { getBackground, getLogo } from "@statsify/assets";
import { renderChartsPage } from "./pages/charts-graphs.js";
import { renderComparisonPage } from "./pages/comparison-ranking.js";
import { renderRadialPage } from "./pages/radial-distribution.js";
import { renderStatPrimitivesPage } from "./pages/stat-primitives.js";
import { renderThemingPage } from "./pages/theming-kitchen.js";
import type { Image } from "skia-canvas";
import type { Player, User } from "@statsify/schemas";

export interface DemoPageProps {
  player: Player;
  skin: Image;
  logo: Image;
  badge?: Image;
  background: Image;
  user: User | null;
}

const DEFAULT_PLAYER = "hypixel";

@Command({
  description: () => "Component showcase (rendering demo)",
  args: [new PlayerArgument("player", false)],
  cooldown: 10,
})
export class DemoCommand {
  private readonly apiService: ApiService;
  private readonly paginateService: PaginateService;

  public constructor() {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

  public async run(context: CommandContext) {
    const user = context.getUser();
    const playerTag = context.option<string | undefined>("player") ?? DEFAULT_PLAYER;

    const [player, background, logo] = await Promise.all([
      this.apiService.getPlayer(playerTag, user),
      getBackground("bedwars", "overall"),
      getLogo(user),
    ]);

    const [skin, badge] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const props: DemoPageProps = { player, skin, logo, badge, background, user };

    const pages = [
      { label: () => "Charts & Graphs", generator: () => renderChartsPage(props) },
      { label: () => "Radial & Distribution", generator: () => renderRadialPage(props) },
      { label: () => "Stat Primitives", generator: () => renderStatPrimitivesPage(props) },
      { label: () => "Comparison & Ranking", generator: () => renderComparisonPage(props) },
      { label: () => "Theming & Kitchen Sink", generator: () => renderThemingPage(props) },
    ];

    return this.paginateService.paginate(context, pages);
  }
}
