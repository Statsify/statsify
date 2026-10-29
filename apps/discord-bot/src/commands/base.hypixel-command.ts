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
  paginate,
  PlayerArgument,
  SubPage,
} from "@statsify/discord";
import { Container } from "typedi";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalTimeData } from "#components";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { noop } from "@statsify/util";
import { render } from "@statsify/rendering";
import type { ApiModeFromGameModes, ApiSubModeForMode, GameMode, GameModeWithSubModes, GameModes, Player, SubModeForMode, User } from "@statsify/schemas";
import type { Image } from "skia-canvas";

export type ProfileTime = "LIVE" | HistoricalTimeData;

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

export interface BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  getPreProfileData?(player: Player): K | Promise<K>;
  filterModes?(player: Player, modes: GameModeWithSubModes<T>[]): GameModeWithSubModes<T>[];
  filterSubmodes?(player: Player, mode: GameModeWithSubModes<T>): GameModeWithSubModes<T>["submodes"];
  getModeEmojis?(modes: GameModeWithSubModes<T>[]): ModeEmoji[];
  getSubModeEmojis?<M extends ApiModeFromGameModes<T>>(mode: M, submodes: SubModeForMode<T, M>[]): ModeEmoji[];
}

@Command({
  description: "",
  args: [PlayerArgument],
  cooldown: 10,
})
export abstract class BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  protected readonly apiService: ApiService;

  public constructor(protected readonly modes: GameModes<T>) {
    this.apiService = Container.get(ApiService);
  }

  public async run(context: CommandContext) {
    const user = context.getUser();
    const tag = context.option<string>("player");

    // A self-lookup already knows the uuid, so its skin and badge don't wait for the player.
    // The catch stops an unhandled rejection when the player lookup throws first.
    const selfSkinAndBadge = !tag && user?.uuid ? this.getSkinAndBadge(user.uuid, user) : undefined;
    selfSkinAndBadge?.catch(noop);

    const player = await this.apiService.getPlayer(tag, user);

    const [logo, [skin, badge], data = noop<K>()] = await Promise.all([
      getLogo(user),
      selfSkinAndBadge ?? this.getSkinAndBadge(player.uuid, user),
      this.getPreProfileData?.(player),
    ]);

    const allModes = this.modes.getModes();
    const filteredModes = this.filterModes?.(player, allModes) ?? allModes;
    const emojis = this.getModeEmojis?.(filteredModes) ?? [];

    const pages: Page[] = filteredModes.map((mode, index) => {
      const pageInput = {
        label: mode.formatted,
        emoji: emojis[index],
      };

      const filteredSubmodes = this.filterSubmodes?.(player, mode) ?? mode.submodes;
      const submodeEmojis = this.getSubModeEmojis?.(
        mode.api,
        filteredSubmodes as SubModeForMode<T, (typeof mode)["api"]>[]
      ) ?? [];

      if (filteredSubmodes.length === 0) {
        const gameMode = { ...mode, submode: undefined } as unknown as GameMode<T>;

        return {
          ...pageInput,
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
              { mode: gameMode, data }
            );

            return render(profile, getTheme(user));
          },
        };
      }

      const subPages = filteredSubmodes.map((submode, index): SubPage => ({
        label: submode.formatted,
        emoji: submodeEmojis[index],
        generator: async (t) => {
          const background = await getBackground(...mapBackground(this.modes, mode.api, submode.api as ApiSubModeForMode<T, (typeof mode)["api"]>));

          const gameMode = {
            api: mode.api,
            formatted: mode.formatted,
            hypixel: mode.hypixel,
            submode,
          } as GameMode<T>;

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
            { mode: gameMode, data }
          );

          return render(profile, getTheme(user));
        },
      }));

      return { ...pageInput, subPages };
    });

    return paginate(context, pages);
  }

  private getSkinAndBadge(uuid: string, user: User | null) {
    return Promise.all([this.apiService.getPlayerSkin(uuid, user), this.apiService.getUserBadge(uuid)]);
  }

  public abstract getProfile(
    base: BaseProfileProps,
    extra: ProfileData<T, K>
  ): JSX.Element;
}
