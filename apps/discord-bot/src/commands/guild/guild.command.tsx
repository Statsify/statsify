import { GuildArgument } from '#arguments';
import { ApiService, PaginateService } from '#services';
import { GuildQuery } from '@statsify/api-client';
import { getAssetPath, getBackground, getImage, getLogo } from '@statsify/assets';
import { Command, CommandContext, SubCommand } from '@statsify/discord';
import { render } from '@statsify/rendering';
import { GuildMember } from '@statsify/schemas';
import { readdir } from 'fs/promises';
import { ErrorMessage } from '../../error.message';
import { getTheme } from '../../themes';
import { GuildListProfile, GuildListProfileProps } from './guild-list.profile';
import { GuildProfile, GuildProfileProps } from './guild.profile';

@Command({ description: (t) => t('commands.guild') })
export class GuildCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t('commands.guild'), args: GuildArgument })
  public async overall(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const guild = await this.getGuild(context);

    const guildRanking = await this.apiService.getGuildRankings(['exp'], guild.id);
    const ranking = guildRanking[0]?.rank ?? 0;

    const guildMaster = guild.members.find((m) => GuildMember.isGuildMaster(m));

    if (!guildMaster)
      throw new ErrorMessage(
        (t) => t('errors.unknown.title'),
        (t) => t('errors.unknown.description')
      );

    const gameIconPaths = await readdir(getAssetPath('games'));

    const gameIcons = Object.fromEntries(
      await Promise.all(
        gameIconPaths.map(async (g) => [g.replace('.png', ''), await getImage(`games/${g}`)])
      )
    );

    const [skin, logo, background] = await Promise.all([
      this.apiService.getPlayerHead(guildMaster.uuid, 16),
      getLogo(user?.tier),
      getBackground('bedwars', 'overall'),
    ]);

    const props: Omit<GuildProfileProps, 'page'> = {
      guild,
      guildMaster,
      skin,
      background,
      ranking,
      logo,
      tier: user?.tier,
      t,
      gameIcons,
    };

    return this.paginateService.paginate(context, [
      {
        label: 'Overall',
        generator: () => render(<GuildProfile {...props} page="overall" />, getTheme(user?.theme)),
      },
      {
        label: 'GEXP',
        generator: () => render(<GuildProfile {...props} page="gexp" />, getTheme(user?.theme)),
      },
      {
        label: 'GEXP Per Game',
        generator: () =>
          render(<GuildProfile {...props} page="expPerGame" />, getTheme(user?.theme)),
      },
      {
        label: 'Misc',
        generator: () => render(<GuildProfile {...props} page="misc" />, getTheme(user?.theme)),
      },
    ]);
  }

  @SubCommand({ description: (t) => t('commands.list'), args: GuildArgument })
  public async list(context: CommandContext) {
    const user = context.getUser();
    const t = context.t();

    const guild = await this.getGuild(context);

    const [logo, background] = await Promise.all([
      getLogo(user?.tier),
      getBackground('bedwars', 'overall'),
    ]);

    const props: GuildListProfileProps = {
      guild,
      background,
      logo,
      tier: user?.tier,
      t,
    };

    return this.paginateService.paginate(context, [
      {
        label: 'List',
        generator: () => render(<GuildListProfile {...props} />, getTheme(user?.theme)),
      },
    ]);
  }

  private getGuild(context: CommandContext) {
    const user = context.getUser();
    const query = context.option<string>('query');
    const type = context.option<GuildQuery>('type');

    return this.apiService.getGuild(query, type, user);
  }
}
