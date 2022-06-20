/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GuildQuery } from '@statsify/api-client';
import { Command } from '@statsify/discord';
import { GeneralModes, GENERAL_MODES, Guild, Player } from '@statsify/schemas';
import { BaseHypixelCommand, BaseProfileProps, ProfileData } from '../base.hypixel-command';
import { GeneralProfile } from './general.profile';

interface PreProfileData {
  guild?: Guild;
  friends?: number;
}

@Command({ description: (t) => t('commands.general') })
export class GeneralCommand extends BaseHypixelCommand<GeneralModes, PreProfileData> {
  public constructor() {
    super(GENERAL_MODES);
  }

  public async getPreProfileData(player: Player): Promise<PreProfileData> {
    const guild = await this.apiService
      .getGuild(player.uuid, GuildQuery.PLAYER)
      .catch(() => undefined);

    const friends = await this.apiService
      .getFriends(player.uuid)
      .then((data) => data.friends.length ?? 0)
      .catch(() => 0);

    return {
      guild,
      friends: friends,
    };
  }

  public getProfile(
    base: BaseProfileProps,
    { data }: ProfileData<GeneralModes, PreProfileData>
  ): JSX.Element {
    return <GeneralProfile {...base} friends={data.friends} guild={data.guild} />;
  }
}
