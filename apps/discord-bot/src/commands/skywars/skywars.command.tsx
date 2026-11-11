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
import { GameMode, Player, SKYWARS_MODES, SkyWarsModes } from "@statsify/schemas";
import { skyWarsKitArmor } from "@statsify/hypixel-data";
import { SkyWarsProfile } from "./skywars.profile.js";

@Command({ description: (t) => t("commands.skywars") })
export class SkyWarsCommand extends BaseHypixelCommand<SkyWarsModes> {
  public constructor() {
    super(SKYWARS_MODES);
  }

  public getArmor(player: Player, { api }: GameMode<SkyWarsModes>) {
    const { kitId } = player.stats.skywars[api];
    return kitId ? skyWarsKitArmor(kitId) : undefined;
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<SkyWarsModes, never>
  ): JSX.Element {
    return <SkyWarsProfile {...base} mode={mode} />;
  }
}
