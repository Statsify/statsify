/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BLITZSG_MODES, BlitzSGKit, BlitzSGModes, GameModeWithSubModes, Player } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "#commands/base.hypixel-command";
import { BlitzSGProfile } from "./blitzsg.profile.js";
import { Command, CommandContext, PlayerArgument } from "@statsify/discord";
import { KitArgument, filterKits } from "#commands/kit.argument";

@Command({
  description: (t) => t("commands.blitzsg"),
  args: [PlayerArgument, new KitArgument(BLITZSG_MODES)],
})
export class BlitzSGCommand extends BaseHypixelCommand<BlitzSGModes> {
  public constructor() {
    super(BLITZSG_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameModeWithSubModes<BlitzSGModes>[],
    context: CommandContext
  ): GameModeWithSubModes<BlitzSGModes>[] {
    return filterBlitzKits(player, modes, context.option<string | null>("kit"));
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BlitzSGModes, never>
  ): JSX.Element {
    return <BlitzSGProfile {...base} mode={mode} />;
  }
}

export function filterBlitzKits(
  player: Player,
  modes: GameModeWithSubModes<BlitzSGModes>[],
  kit?: string | null
): GameModeWithSubModes<BlitzSGModes>[] {
  const { blitzsg } = player.stats;

  return filterKits(
    modes,
    (a, b) => (blitzsg[b.api] as BlitzSGKit).exp - (blitzsg[a.api] as BlitzSGKit).exp,
    kit
  );
}
