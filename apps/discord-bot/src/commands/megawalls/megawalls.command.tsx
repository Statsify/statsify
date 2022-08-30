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
} from "../base.hypixel-command.js";
import { Command } from "@statsify/discord";
import {
  GameMode,
  MEGAWALLS_MODES,
  MegaWallsKit,
  MegaWallsModes,
  Player,
} from "@statsify/schemas";
import { MegaWallsProfile } from "./megawalls.profile.js";

@Command({ description: (t) => t("commands.megawalls") })
export class MegaWallsCommand extends BaseHypixelCommand<MegaWallsModes> {
  public constructor() {
    super(MEGAWALLS_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameMode<MegaWallsModes>[]
  ): GameMode<MegaWallsModes>[] {
    const { megawalls } = player.stats;
    const [overall, ...kits] = modes;

    const filteredKits = kits
      .slice(1, -1)
      .sort(
        (a, b) =>
          (megawalls[b.api] as MegaWallsKit).points -
          (megawalls[a.api] as MegaWallsKit).points
      )
      .slice(0, 24);

    return [overall, ...filteredKits];
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<MegaWallsModes, never>
  ): JSX.Element {
    return <MegaWallsProfile {...base} mode={mode} />;
  }
}
