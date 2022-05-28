import { PlayerArgument } from '#arguments';
import { BaseProfileProps } from '#profiles/base.profile';
import { ApiService, Page, PaginateService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { prettify } from '@statsify/util';

@Command({
  description: '',
  args: [PlayerArgument],
  cooldown: 5,
})
export abstract class HypixelCommand<T extends ReadonlyArray<any>> {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayer,
      context.option('player')
    );

    const [logo, skin] = await Promise.all([
      getLogo(user?.premium),
      this.apiService.getPlayerSkin(player.uuid),
    ]);

    const { width, height } = this.getDimensions();
    const modes = this.getModes();

    const pages: Page[] = modes.map((mode) => ({
      label: prettify(mode),
      generator: async (t) => {
        const background = await getBackground(...this.getBackground(mode));

        return JSX.render(
          this.getProfile(
            {
              player,
              skin,
              background,
              logo,
              t,
              premium: user?.premium,
              badge: player.user?.badge,
            },
            mode
          ),
          width,
          height
        );
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  public abstract getDimensions(): { width: number; height: number };

  public abstract getBackground(mode: T[number]): Parameters<typeof getBackground>;

  public abstract getModes(): T;

  public abstract getProfile(base: BaseProfileProps, mode: T[number]): JSX.ElementNode;
}
