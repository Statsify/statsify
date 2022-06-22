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
} from "../base.hypixel-command";
import { Command } from "@statsify/discord";
import { SKYWARS_MODES, SkyWarsModes } from "@statsify/schemas";
import { SkyWarsProfile } from "./skywars.profile";

@Command({ description: (t) => t("commands.skywars") })
export class SkyWarsCommand extends BaseHypixelCommand<SkyWarsModes> {
  public constructor() {
    super(SKYWARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<SkyWarsModes, never>
  ): JSX.Element {
    return <SkyWarsProfile {...base} mode={mode} />;
  }
}
