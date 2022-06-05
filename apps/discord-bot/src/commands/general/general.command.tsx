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

    const friends = await this.apiService.getFriends(player.uuid, 0).catch(() => ({ length: 0 }));

    return {
      guild,
      friends: friends.length,
    };
  }

  public getProfile(
    base: BaseProfileProps,
    { data }: ProfileData<GeneralModes, PreProfileData>
  ): JSX.Element {
    return <GeneralProfile {...base} friends={data.friends} guild={data.guild} />;
  }
}
