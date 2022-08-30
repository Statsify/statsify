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
  LocalizationString,
  LocalizeFunction,
  Page,
  PaginateService,
  PlayerArgument,
} from "@statsify/discord";
import { Container } from "typedi";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalType } from "@statsify/api-client";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { noop } from "@statsify/util";
import { render } from "@statsify/rendering";
import type { GameMode, GameModes, Player, User } from "@statsify/schemas";
import type { Image } from "skia-canvas";

export type ProfileTime = "LIVE" | HistoricalType;

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  user: User | null;
  badge?: Image;
  t: LocalizeFunction;
  time: ProfileTime;
}

export interface ProfileData<T extends GamesWithBackgrounds, K = never> {
  mode: GameMode<T>;
  data: K;
}

export type ModeEmoji = LocalizationString | false | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  getPreProfileData?(player: Player): K | Promise<K>;
  filterModes?(player: Player, modes: GameMode<T>[]): GameMode<T>[];
  getModeEmojis?(modes: GameMode<T>[]): ModeEmoji[];
}

@Command({
  description: "",
  args: [PlayerArgument],
  cooldown: 10,
})
export abstract class BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  protected readonly apiService: ApiService;
  protected readonly paginateService: PaginateService;

  public constructor(protected readonly modes: GameModes<T>) {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const data: K = (await this.getPreProfileData?.(player)) ?? noop();

    const allModes = this.modes.getModes();
    const filteredModes = this.filterModes?.(player, allModes) ?? allModes;
    const emojis = this.getModeEmojis?.(filteredModes) ?? [];

    const pages: Page[] = filteredModes.map((mode, index) => ({
      label: mode.formatted,
      emoji: emojis[index],
      generator: async (t) => {
        const background = await getBackground(...mapBackground(this.modes, mode.api));

        const profile = this.getProfile(
          {
            player,
            skin,
            background,
            logo,
            t,
            user,
            badge,
            time: "LIVE",
          },
          { mode, data }
        );

        return render(profile, getTheme(user));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  public abstract getProfile(
    base: BaseProfileProps,
    extra: ProfileData<T, K>
  ): JSX.Element;
}
