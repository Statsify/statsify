import { PlayerArgument } from '#arguments';
import type { BaseProfileProps } from '#profiles/base.profile';
import { ApiService, Page, PaginateService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import type { Player } from '@statsify/schemas';
import { noop, prettify } from '@statsify/util';

export interface ProfileData<T extends ReadonlyArray<any>, K = never> {
  mode: T[number];
  data: K;
}

export interface HypixelCommand<T extends ReadonlyArray<any>, K = never> {
  getModes?(): T;
  getPreProfileData?(player: Player): K | Promise<K>;
}

@Command({
  description: '',
  args: [PlayerArgument],
  cooldown: 5,
})
export abstract class HypixelCommand<T extends ReadonlyArray<any>, K = never> {
  public constructor(
    protected readonly apiService: ApiService,
    protected readonly paginateService: PaginateService
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

    const modes = this.getModes?.() ?? ['default'];

    const data: K = (await this.getPreProfileData?.(player)) ?? noop();

    const pages: Page[] = modes.map((mode) => ({
      label: prettify(mode),
      generator: async (t) => {
        const background = await getBackground(...this.getBackground(mode));

        const profile = this.getProfile(
          {
            player,
            skin,
            background,
            logo,
            t,
            premium: user?.premium,
            badge: player.user?.badge,
          },
          { mode, data }
        );

        return JSX.render(profile);
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  public abstract getBackground(mode: T[number]): Parameters<typeof getBackground>;

  public abstract getProfile(base: BaseProfileProps, extra: ProfileData<T, K>): JSX.ElementNode;
}
