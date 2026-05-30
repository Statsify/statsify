/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS_MODES, BedWarsModes, type GameMode } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "#commands/base.hypixel-command";
import { BedWarsProfile } from "./bedwars.profile.js";
import { Command, CommandContext, Message, Page } from "@statsify/discord";
import { buildCountUpFrames, renderStatic } from "../../util/count-up.js";
import { encodeAnimatedWebP } from "../../util/animated-webp.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { noop } from "@statsify/util";

const COUNT_UP_FRAMES = 16;
const COUNT_UP_DELAY_MS = 60;

@Command({ description: (t) => t("commands.bedwars") })
export class BedWarsCommand extends BaseHypixelCommand<BedWarsModes> {
  public constructor() {
    super(BEDWARS_MODES);
  }

  public override async run(context: CommandContext) {
    const user = context.getUser();
    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, badge, skin] = await Promise.all([
      getLogo(user),
      this.apiService.getUserBadge(player.uuid),
      this.apiService.getPlayerSkin(player.uuid, user),
    ]);

    const allModes = this.modes.getModes();
    const filteredModes = this.filterModes?.(player, allModes) ?? allModes;
    const emojis = this.getModeEmojis?.(filteredModes) ?? [];

    const pages: Page[] = filteredModes.map((mode, index) => {
      const gameMode = { ...mode, submode: undefined } as unknown as GameMode<BedWarsModes>;

      return {
        label: mode.formatted,
        emoji: emojis[index],
        generator: async (t) => {
          const background = await getBackground(...mapBackground(this.modes, mode.api));
          const theme = getTheme(user);

          const profileNode = this.getProfile(
            { player, skin, background, logo, t, user, badge, time: "LIVE" },
            { mode: gameMode, data: noop() }
          );

          const { canvas: staticCanvas, regions } = renderStatic(profileNode, theme);

          const countUpFrames = buildCountUpFrames(staticCanvas, regions, {
            frames: COUNT_UP_FRAMES,
            delayMs: COUNT_UP_DELAY_MS,
          });

          // Frame 0 = final values so Discord's static thumbnail shows correct stats.
          // Animation plays once (loop=1): thumbnail frame, then count from 0 → final.
          const allFrames = [countUpFrames.at(-1)!, ...countUpFrames];
          const webpData = await encodeAnimatedWebP(allFrames, COUNT_UP_DELAY_MS, 1);

          return new Message({
            files: [{ name: "bedwars.webp", data: webpData, type: "image/webp" }],
            attachments: [],
          });
        },
      };
    });

    return this.paginateService.paginate(context, pages);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BedWarsModes, never>
  ): JSX.Element {
    return <BedWarsProfile {...base} mode={mode} />;
  }
}
