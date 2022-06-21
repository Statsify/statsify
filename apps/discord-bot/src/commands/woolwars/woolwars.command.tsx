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
import { WOOL_WARS_MODES, WoolWarsModes } from "@statsify/schemas";
import { WoolWarsProfile } from "./woolwars.profile";

@Command({ description: (t) => t("commands.woolwars") })
export class WoolWarsCommand extends BaseHypixelCommand<WoolWarsModes> {
  public constructor() {
    super(WOOL_WARS_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<WoolWarsModes, never>
  ): JSX.Element {
    return <WoolWarsProfile {...base} mode={mode} />;
  }
}
