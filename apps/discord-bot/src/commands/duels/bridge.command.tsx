/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BRIDGE_MODES, BridgeModes } from "@statsify/schemas";
import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "#commands/base.hypixel-command";
import { BridgeProfile } from "./bridge.profile.js";
import { Command } from "@statsify/discord";

@Command({ description: (t) => t("commands.bridge") })
export class BridgeCommand extends BaseHypixelCommand<BridgeModes> {
  public constructor() {
    super(BRIDGE_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<BridgeModes>
  ): JSX.Element {
    return <BridgeProfile {...base} mode={mode} />;
  }
}
