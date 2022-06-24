/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps } from "../base.hypixel-command";
import { Command } from "@statsify/discord";
import { PARKOUR_MODES, ParkourModes } from "@statsify/schemas";
import { ParkourProfile } from "./parkour.profile";

@Command({ description: (t) => t("commands.paintball") })
export class ParkourCommand extends BaseHypixelCommand<ParkourModes> {
  public constructor() {
    super(PARKOUR_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <ParkourProfile {...base} />;
  }
}
