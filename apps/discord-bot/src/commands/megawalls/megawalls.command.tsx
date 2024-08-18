/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { GameModeWithSubModes, MEGAWALLS_MODES, MegaWallsModes, Player } from "@statsify/schemas";
import { MegaWallsProfile, filterMegaWallsKits } from "./megawalls.profile.js";

@Command({ description: (t) => t("commands.megawalls") })
export class MegaWallsCommand extends BaseHypixelCommand<MegaWallsModes> {
  public constructor() {
    super(MEGAWALLS_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameModeWithSubModes<MegaWallsModes>[]
  ): GameModeWithSubModes<MegaWallsModes>[] {
    return filterMegaWallsKits(player, modes);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<MegaWallsModes, never>
  ): JSX.Element {
    return <MegaWallsProfile {...base} mode={mode} />;
  }
}
