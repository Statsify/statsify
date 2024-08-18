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
import { WOOLGAMES_MODES, WoolGamesModes } from "@statsify/schemas";
import { WoolGamesProfile } from "./woolgames.profile.js";

@Command({ description: (t) => t("commands.woolgames") })
export class WoolGamesCommand extends BaseHypixelCommand<WoolGamesModes> {
  public constructor() {
    super(WOOLGAMES_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<WoolGamesModes>
  ): JSX.Element {
    return <WoolGamesProfile {...base} mode={mode} />;
  }
}
