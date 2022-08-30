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
} from "../base.hypixel-command.js";
import { Command } from "@statsify/discord";
import { DUELS_MODES, DuelsModes } from "@statsify/schemas";
import { DuelsProfile } from "./duels.profile.js";

@Command({ description: (t) => t("commands.duels") })
export class DuelsCommand extends BaseHypixelCommand<DuelsModes> {
  public constructor() {
    super(DUELS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<DuelsModes>
  ): JSX.Element {
    return <DuelsProfile {...base} mode={mode} />;
  }
}
