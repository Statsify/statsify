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
import { GENERAL_MODES, GeneralModes, Guild, Player } from "@statsify/schemas";
import { GeneralProfile } from "./general.profile";
import { GuildQuery } from "@statsify/api-client";

interface PreProfileData {
  guild?: Guild;
}

@Command({ description: (t) => t("commands.general") })
export class GeneralCommand extends BaseHypixelCommand<GeneralModes, PreProfileData> {
  public constructor() {
    super(GENERAL_MODES);
  }

  public async getPreProfileData(player: Player): Promise<PreProfileData> {
    const guild = await this.apiService
      .getGuild(player.uuid, GuildQuery.PLAYER)
      .catch(() => undefined);

    return {
      guild,
    };
  }

  public getProfile(
    base: BaseProfileProps,
    { data }: ProfileData<GeneralModes, PreProfileData>
  ): JSX.Element {
    return <GeneralProfile {...base} guild={data.guild} />;
  }
}
