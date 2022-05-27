import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { PlayerArgument } from '../arguments';
import { SkyWarsProfile } from '../profiles/skywars.profile';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Displays this message.',
  args: [PlayerArgument],
  cooldown: 5,
})
export class SkyWarsCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayer,
      context.option('player')
    );

    const skin = await this.apiService.getPlayerSkin(player.uuid);

    const width = 870;
    const height = 780;

    const modes = ['overall'] as const;

    const background = await getBackground('skywars', 'overall');
    const logo = await getLogo(user?.premium);

    const images = await Promise.all(
      modes.map((mode) =>
        JSX.render(
          <SkyWarsProfile
            background={background}
            player={player}
            skin={skin}
            mode={mode}
            logo={logo}
            premium={user?.premium}
            badge={player.user?.badge}
            t={context.t()}
          />,
          width,
          height
        ).toBuffer('png')
      )
    );

    return {
      files: images.map((image) => ({ name: 'image.png', data: image, type: 'image/png' })),
    };
  }
}
