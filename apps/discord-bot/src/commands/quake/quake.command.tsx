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
import { QUAKE_MODES, QuakeModes } from "@statsify/schemas";
import { QuakeProfile } from "./quake.profile.js";

@Command({ description: (t) => t("commands.quake") })
export class QuakeCommand extends BaseHypixelCommand<QuakeModes> {
  public constructor() {
    super(QUAKE_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<QuakeModes>
  ): JSX.Element {
    return <QuakeProfile {...base} mode={mode} />;
  }
}
