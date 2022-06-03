import { PlayerArgument } from '#arguments';
import { mapBackground } from '#constants';
import { ApiService, PaginateService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext, SubCommand } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { BEDWARS_MODES } from '@statsify/schemas';
import { CompareProfile } from './compare.profile';

const args = [new PlayerArgument('player1', true), new PlayerArgument('player2')];

@Command({ description: (t) => t('commands.compare') })
export class Compare {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t('commands.bedwars'), args })
  public bedwars(context: CommandContext) {
    return this.compare(context);
  }

  private async compare(context: CommandContext) {
    const user = context.getUser();
    const premium = user?.premium ?? false;

    const [player1, player2] = await Promise.all([
      this.apiService.getWithUser(null, this.apiService.getPlayer, context.option('player1')),
      this.apiService.getWithUser(user, this.apiService.getPlayer, context.option('player2')),
    ]);

    const [head1, head2, logo, background] = await Promise.all([
      this.apiService.getPlayerHead(player1.uuid, 32),
      this.apiService.getPlayerHead(player2.uuid, 32),
      getLogo(premium),
      getBackground(...mapBackground(BEDWARS_MODES, 'overall')),
    ]);

    const canvas = JSX.render(
      <CompareProfile
        background={background}
        head1={head1}
        head2={head2}
        logo={logo}
        player1={player1}
        player2={player2}
        premium={premium}
        t={context.t()}
      />
    );

    return this.paginateService.paginate(context, [{ label: '', generator: () => canvas }]);
  }
}
