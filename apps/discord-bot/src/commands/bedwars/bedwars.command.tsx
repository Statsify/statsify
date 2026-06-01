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
import { type BoxGeometry, buildShineFrames, buildShineTheme } from "../../util/shine.js";
import { Command, CommandContext, Message, Page } from "@statsify/discord";
import { encodeAnimatedWebP } from "../../util/animated-webp.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { mapBackground } from "#constants";
import { noop } from "@statsify/util";
import { render } from "@statsify/rendering";

/** Frames × delay = total loop length: 30 × 100 ms = 3.0 s */
const SHINE_FRAMES = 30;
const SHINE_DELAY_MS = 100;

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
          const baseTheme = getTheme(user);

          const profileNode = this.getProfile(
            { player, skin, background, logo, t, user, badge, time: "LIVE" },
            { mode: gameMode, data: noop() }
          );

          // Render the base card once, collecting every box's painted geometry
          // via the theme interceptor — single pass, no re-render per frame.
          const boxes: BoxGeometry[] = [];
          const shineTheme = buildShineTheme(baseTheme, boxes);
          const baseCanvas = render(profileNode, shineTheme);

          // Per-frame: copy base canvas + draw diagonal highlight on each box.
          // Only the shine layer changes; all other pixels are identical.
          const frameCanvases = buildShineFrames(
            baseCanvas,
            boxes,
            baseCanvas.width,
            baseCanvas.height,
            { frames: SHINE_FRAMES }
          );

          // Looping (loop=0) — the shine sweeps continuously.
          const webpData = await encodeAnimatedWebP(frameCanvases, SHINE_DELAY_MS, 0);

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
