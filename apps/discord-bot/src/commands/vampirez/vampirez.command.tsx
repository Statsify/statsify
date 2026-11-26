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
import { Command } from "@statsify/discord";
import { VAMPIREZ_MODES, VampireZModes } from "@statsify/schemas";
import { VampireZProfile } from "./vampirez.profile.js";

@Command({ description: (t) => t("commands.vampirez") })
export class VampireZCommand extends BaseHypixelCommand<VampireZModes> {
  public constructor() {
    super(VAMPIREZ_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<VampireZModes>
  ): JSX.Element {
    return <VampireZProfile {...base} mode={mode} />;
  }
}
