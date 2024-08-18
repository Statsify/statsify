/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps } from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { type GameModeWithSubModes, Player, SKYWARS_MODES, SkyWarsModes } from "@statsify/schemas";
import { SkyWarsChallengesProfile } from "./skywars-challenges.profile.js";

@Command({ description: (t) => t("commands.skywars-challenges") })
export class SkyWarsChallengesCommand extends BaseHypixelCommand<SkyWarsModes> {
  public constructor() {
    super(SKYWARS_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameModeWithSubModes<SkyWarsModes>[]
  ): GameModeWithSubModes<SkyWarsModes>[] {
    return [modes[0]];
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <SkyWarsChallengesProfile {...base} />;
  }
}
