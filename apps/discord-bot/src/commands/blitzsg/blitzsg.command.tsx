/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BLITZSG_MODES, BlitzSGModes, GameMode, Player } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "#commands/base.hypixel-command";
import { BlitzSGProfile, filterBlitzKits } from "./blitzsg.profile.js";
import { Command } from "@statsify/discord";

@Command({ description: (t) => t("commands.blitzsg") })
export class BlitzSGCommand extends BaseHypixelCommand<BlitzSGModes> {
  public constructor() {
    super(BLITZSG_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameMode<BlitzSGModes>[]
  ): GameMode<BlitzSGModes>[] {
    return filterBlitzKits(player, modes);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BlitzSGModes>
  ): JSX.Element {
    return <BlitzSGProfile {...base} mode={mode} />;
  }
}
