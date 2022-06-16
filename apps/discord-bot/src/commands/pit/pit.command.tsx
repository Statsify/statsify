import { PlayerArgument } from '#arguments';
import { ApiService, PaginateService, PitPandaService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext } from '@statsify/discord';
import { render } from '@statsify/rendering';
import { getTheme } from '../../themes';
import { PitProfile } from './pit.profile';

@Command({ description: (t) => t('commands.pit'), args: [PlayerArgument] })
export class PitCommand {
  public constructor(
    private readonly pitPandaService: PitPandaService,
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const player = await this.pitPandaService.getPlayer(context.option<string>('player'));

    console.log(player);

    const [skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
      getLogo(user?.tier),
      getBackground('bedwars', 'overall'),
    ]);

    const canvas = render(
      <PitProfile
        player={player}
        background={background}
        logo={logo}
        skin={skin}
        t={t}
        tier={user?.tier}
        badge={badge}
      />,
      getTheme(user?.theme)
    );

    return this.paginateService.paginate(context, [
      {
        label: 'Overall',
        generator: () => canvas,
      },
    ]);
  }
}
