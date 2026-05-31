/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps } from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { BEDWARS_MODES, BedWarsModes, GameModeWithSubModes, Player } from "@statsify/schemas";

import { BedWarsChallengesProfile } from "./bedwars-challenges.profile.js";

@Command({ description: (t) => t("commands.bedwars-challenges") })
export class BedWarsChallengesCommand extends BaseHypixelCommand<BedWarsModes> {
  public constructor() {
    super(BEDWARS_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameModeWithSubModes<BedWarsModes>[]
  ): GameModeWithSubModes<BedWarsModes>[] {
    return [modes[0]];
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <BedWarsChallengesProfile {...base} />;
  }
}
