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
import { DROPPER_MODES, DropperModes } from "@statsify/schemas";
import { DropperProfile } from "./dropper.profile.js";

@Command({ description: (t) => t("commands.dropper") })
export class DropperCommand extends BaseHypixelCommand<DropperModes> {
  public constructor() {
    super(DROPPER_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<DropperModes>
  ): JSX.Element {
    return <DropperProfile {...base} mode={mode} />;
  }
}
