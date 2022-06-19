/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container from "typedi";
import { ApiService } from "#services";
import {
  Command,
  CommandContext,
  LocalizeFunction,
  Page,
  PaginateService,
  PlayerArgument,
} from "@statsify/discord";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalType } from "@statsify/api-client";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "../themes";
import { noop, prettify } from "@statsify/util";
import { render } from "@statsify/rendering";
import type { Image } from "skia-canvas";
import type { Player, UserTier } from "@statsify/schemas";

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  tier?: UserTier;
  badge?: Image;
  t: LocalizeFunction;
  time: "LIVE" | HistoricalType;
}

export interface ProfileData<T extends GamesWithBackgrounds, K = never> {
  mode: T[number];
  data: K;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  getPreProfileData?(player: Player): K | Promise<K>;
  filterModes?(player: Player): string[];
}

@Command({
  description: "",
  args: [PlayerArgument],
  cooldown: 5,
})
export abstract class BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  protected readonly apiService: ApiService;
  protected readonly paginateService: PaginateService;

  public constructor(protected readonly modes: T) {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const data: K = (await this.getPreProfileData?.(player)) ?? noop();

    const filteredModes = this.filterModes?.(player) ?? this.modes;

    const pages: Page[] = filteredModes.map((mode) => ({
      label: prettify(mode),
      generator: async (t) => {
        const background = await getBackground(
          ...mapBackground(this.modes, mode as T[number])
        );

        const profile = this.getProfile(
          {
            player,
            skin,
            background,
            logo,
            t,
            tier: user?.tier,
            badge,
            time: "LIVE",
          },
          { mode: mode as T[number], data }
        );

        return render(profile, getTheme(user?.theme));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  public abstract getProfile(
    base: BaseProfileProps,
    extra: ProfileData<T, K>
  ): JSX.Element;
}
