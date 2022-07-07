/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS_MODES, BedWarsModes, GameMode, Player } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "../base.hypixel-command";
import { BedWarsChallenges, BedWarsProfile } from "./bedwars.profile";
import { Command } from "@statsify/discord";

@Command({ description: (t) => t("commands.bedwars") })
export class BedWarsCommand extends BaseHypixelCommand<BedWarsModes> {
  public constructor() {
    super(BEDWARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BedWarsModes, never>
  ): JSX.Element {
    return <BedWarsProfile {...base} mode={mode} />;
  }
}

@Command({ description: (t) => t("commands.bedwarsChallenges") })
export class BedWarsChallengesCommand extends BaseHypixelCommand<BedWarsModes> {
  public constructor() {
    super(BEDWARS_MODES);
  }

  public filterModes(
    player: Player,
    modes: GameMode<BedWarsModes>[]
  ): GameMode<BedWarsModes>[] {
    return [modes[0]];
  }
  public getProfile(base: BaseProfileProps): JSX.Element {
    return <BedWarsChallenges {...base} />;
  }
}
