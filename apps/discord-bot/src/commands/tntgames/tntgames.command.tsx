/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, type BaseProfileProps, type ProfileData } from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { type TNTGamesModes, TNT_GAMES_MODES } from "@statsify/schemas";
import { TNTGamesProfile } from "./tntgames.profile.js";

@Command({ description: (t) => t("commands.tntgames") })
export class TNTGamesCommand extends BaseHypixelCommand<TNTGamesModes> {
  public constructor() {
    super(TNT_GAMES_MODES);
  }

  public getProfile(base: BaseProfileProps, { mode }: ProfileData<TNTGamesModes>): JSX.Element {
    return <TNTGamesProfile {...base} mode={mode} />;
  }
}
