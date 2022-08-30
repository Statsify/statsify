/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps } from "../base.hypixel-command.js";
import { Command, PlayerArgument } from "@statsify/discord";
import { PIT_MODES, PitModes } from "@statsify/schemas";
import { PitProfile } from "./pit.profile.js";

@Command({ description: (t) => t("commands.pit"), args: [PlayerArgument] })
export class PitCommand extends BaseHypixelCommand<PitModes> {
  public constructor() {
    super(PIT_MODES);
  }

  public getProfile(base: BaseProfileProps): JSX.Element {
    return <PitProfile {...base} />;
  }
}
