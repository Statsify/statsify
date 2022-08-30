/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS_MODES, BedWarsModes } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "../base.hypixel-command.js";
import { BedWarsProfile } from "./bedwars.profile.js";
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
