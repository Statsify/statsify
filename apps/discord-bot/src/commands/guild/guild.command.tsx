import { GuildArgument } from '#arguments';
import { ApiService, PaginateService } from '#services';
import { GuildQuery } from '@statsify/api-client';
import { getBackground, getImage, getLogo } from '@statsify/assets';
import { Command, CommandContext, SubCommand } from '@statsify/discord';
import { render } from '@statsify/rendering';
import { GuildMember } from '@statsify/schemas';
import { ErrorMessage } from '../../error.message';
import { getTheme } from '../../themes';
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
    const query = context.option<string>('query');
    const type = context.option<GuildQuery>('type');

    const guild = await this.apiService.getGuild(query, type, user);

    const guildRanking = await this.apiService.getGuildRanking('exp', guild.nameToLower);
    const ranking = guildRanking.rank ?? 0;

    const guildMaster = guild.members.find((m) => GuildMember.isGuildMaster(m));

    if (!guildMaster)
      throw new ErrorMessage(
        (t) => t('errors.unknown.title'),
        (t) => t('errors.unknown.description')
      );

    const games = await Promise.all(guild.preferredGames.map((g) => getImage(`games/${g}.png`)));

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
      games,
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
    ]);
  }
}
