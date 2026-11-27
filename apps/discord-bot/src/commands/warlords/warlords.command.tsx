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
import { WARLORDS_MODES, WarlordsModes } from "@statsify/schemas";
import { WarlordsProfile } from "./warlords.profile.js";

@Command({ description: (t) => t("commands.warlords") })
export class WarlordsCommand extends BaseHypixelCommand<WarlordsModes> {
  public constructor() {
    super(WARLORDS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<WarlordsModes>
  ): JSX.Element {
    return <WarlordsProfile {...base} mode={mode} />;
  }
}
