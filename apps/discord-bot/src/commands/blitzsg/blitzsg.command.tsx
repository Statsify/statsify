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
import { Command } from "@statsify/discord";

@Command({ description: (t) => t("commands.blitzsg") })
export class BlitzSGCommand extends BaseHypixelCommand<BlitzSGModes> {
  public constructor() {
    super(BLITZSG_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameModeWithSubModes<BlitzSGModes>[]
  ): GameModeWithSubModes<BlitzSGModes>[] {
    return filterBlitzKits(player, modes);
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
  modes: GameModeWithSubModes<BlitzSGModes>[]
): GameModeWithSubModes<BlitzSGModes>[] {
  const { blitzsg } = player.stats;
  const [overall, ...kits] = modes;

  const filteredKits = [...kits]
    .sort((a, b) => (blitzsg[b.api] as BlitzSGKit).exp - (blitzsg[a.api] as BlitzSGKit).exp)
    .slice(0, 24);

  return [overall, ...filteredKits];
}
