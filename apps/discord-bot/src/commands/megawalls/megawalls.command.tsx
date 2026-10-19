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
import { Command, CommandContext, PlayerArgument } from "@statsify/discord";
import { GameModeWithSubModes, MEGAWALLS_MODES, MegaWallsModes, Player } from "@statsify/schemas";
import { KitArgument, filterKits } from "#commands/kit.argument";
import { MegaWallsProfile } from "./megawalls.profile.js";

@Command({
  description: (t) => t("commands.megawalls"),
  args: [PlayerArgument, new KitArgument(MEGAWALLS_MODES)],
})
export class MegaWallsCommand extends BaseHypixelCommand<MegaWallsModes> {
  public constructor() {
    super(MEGAWALLS_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameModeWithSubModes<MegaWallsModes>[],
    context?: CommandContext
  ): GameModeWithSubModes<MegaWallsModes>[] {
    return filterMegaWallsKits(player, modes, context?.option<string | null>("kit"));
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<MegaWallsModes, never>
  ): JSX.Element {
    return <MegaWallsProfile {...base} mode={mode} />;
  }
}

export function filterMegaWallsKits(
  player: Player,
  modes: GameModeWithSubModes<MegaWallsModes>[],
  kit?: string | null
): GameModeWithSubModes<MegaWallsModes>[] {
  const { megawalls } = player.stats;

  return filterKits(
    modes,
    (a, b) => megawalls[b.api].points - megawalls[a.api].points,
    kit
  );
}
