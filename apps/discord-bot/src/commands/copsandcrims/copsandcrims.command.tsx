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
import { COPS_AND_CRIMS_MODES, CopsAndCrimsModes } from "@statsify/schemas";
import { Command } from "@statsify/discord";
import { CopsAndCrimsProfile } from "./copsandcrims.profile.js";

@Command({ description: (t) => t("commands.copsandcrims") })
export class CopsAndCrimsCommand extends BaseHypixelCommand<CopsAndCrimsModes> {
  public constructor() {
    super(COPS_AND_CRIMS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<CopsAndCrimsModes>
  ): JSX.Element {
    return <CopsAndCrimsProfile {...base} mode={mode} />;
  }
}
