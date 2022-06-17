import { INFO_COLOR } from '#constants';
import { ApiService, Page, PaginateService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';
import { games } from '@statsify/schemas';
import { prettify } from '@statsify/util';

@Command({
  description: (t) => t('commands.gameCounts'),
})
export class GameCountsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const t = context.t();
    const counts = await this.apiService.getGameCounts();
    const resource = await this.apiService.getResource('games');
    const gameInfo = resource?.games;

    const pages: Page[] = [
      {
        label: 'Overall',
        generator: () =>
          new EmbedBuilder()
            .title((t) => t('embeds.gameCounts.title'))
            .description(
              (t) =>
                `\`•\` **${t('stats.total')}**: \`${t(
                  Object.values(counts).reduce((c, v) => c + (v.players ?? 0), 0)
                )}\`\n\n` +
                Object.entries(counts)
                  .sort((a, b) => b[1].players - a[1].players)
                  .map(
                    ([game, gamePlayers]) =>
                      `\`•\` ${t(`emojis:games.${game}`)} **${this.getGameName(game)}**: \`${t(
                        gamePlayers.players
                      )}\``
                  )
                  .join('\n')
            )
            .color(INFO_COLOR),
      },
      ...Object.entries(counts)
        .filter(([, gamePlayers]) => gamePlayers.modes && Object.keys(gamePlayers.modes).length > 1)
        .map(([game, gamePlayers]) => {
          const gameName = this.getGameName(game);
          return {
            label: gameName,
            emoji: t(`emojis:games.${game}`),
            generator: () =>
              new EmbedBuilder()
                .title((t) => `${gameName} ${t('players')}`)
                .description(
                  (t) =>
                    `\`•\` **${t('stats.total')}**: \`${t(gamePlayers.players)}\`\n\n` +
                    Object.entries(gamePlayers.modes)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .map(
                        ([mode, players]) =>
                          `\`•\` **${
                            gameInfo[game]?.modeNames?.[mode] ?? prettify(mode.toLowerCase())
                          }**: \`${t(Number(players))}\``
                      )
                      .join('\n')
                )
                .color(INFO_COLOR),
          };
        }),
    ];

    return this.paginateService.paginate(context, pages);
  }

  private getGameName(game: string) {
    return games.find(({ code }) => code == game)?.name ?? prettify(game);
  }
}
