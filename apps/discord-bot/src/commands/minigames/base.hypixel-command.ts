import { PlayerArgument } from '#arguments';
import { GamesWithBackgrounds, mapBackground } from '#constants';
import type { BaseProfileProps } from '#profiles/base.profile';
import { ApiService, Page, PaginateService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import type { Player } from '@statsify/schemas';
import { noop, prettify } from '@statsify/util';
import Container from 'typedi';

export interface ProfileData<T extends GamesWithBackgrounds, K = never> {
  mode: T[number];
  data: K;
}

export interface BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  getPreProfileData?(player: Player): K | Promise<K>;
  filterModes?(player: Player): string[];
}

@Command({
  description: '',
  args: [PlayerArgument],
  cooldown: 5,
})
export abstract class BaseHypixelCommand<T extends GamesWithBackgrounds, K = never> {
  protected readonly apiService: ApiService;
  protected readonly paginateService: PaginateService;

  public constructor(protected readonly modes: T) {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

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

    const data: K = (await this.getPreProfileData?.(player)) ?? noop();

    const filteredModes = this.filterModes?.(player) ?? this.modes;

    const pages: Page[] = filteredModes.map((mode) => ({
      label: prettify(mode),
      generator: async (t) => {
        const background = await getBackground(...mapBackground(this.modes, mode as T[number]));

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
          { mode: mode as T[number], data }
        );

        return JSX.render(profile);
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  public abstract getProfile(base: BaseProfileProps, extra: ProfileData<T, K>): JSX.ElementNode;
}
