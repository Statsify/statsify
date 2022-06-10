import { PlayerArgument } from '#arguments';
import { GamesWithBackgrounds, mapBackground } from '#constants';
import { ApiService, Page, PaginateService } from '#services';
import { HistoricalType } from '@statsify/api-client';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext, LocalizeFunction } from '@statsify/discord';
import { render } from '@statsify/rendering';
import type { Player } from '@statsify/schemas';
import { noop, prettify } from '@statsify/util';
import type { Image } from 'skia-canvas';
import Container from 'typedi';
import { getTheme } from '../themes';

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  premium?: boolean;
  badge?: Image;
  t: LocalizeFunction;
  time: 'LIVE' | HistoricalType;
}

export interface ProfileData<T extends GamesWithBackgrounds, K = never> {
  mode: T[number];
  data: K;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.premium),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
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
            badge,
            time: 'LIVE',
          },
          { mode: mode as T[number], data }
        );

        return render(profile, getTheme(user?.theme));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  public abstract getProfile(base: BaseProfileProps, extra: ProfileData<T, K>): JSX.Element;
}
