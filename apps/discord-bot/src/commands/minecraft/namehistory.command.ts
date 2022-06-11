import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { MojangApiService, PaginateService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';

@Command({ description: 'commands.namehistory', args: [new MojangPlayerArgument()] })
export class NameHistoryCommand {
  public constructor(
    private readonly mojangApiService: MojangApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const player = await this.mojangApiService.getPlayer(context.option('player'));
    const thumbURL = this.mojangApiService.faceIconUrl(player.uuid);
    const nameHistory = player.username_history.reverse();

    const groupSize = 25;

    const name = `${player.username}${player.username.slice(-1) == "s'" ? "'" : "'s"}`;

    const groups = Array.from({ length: Math.ceil(nameHistory.length / groupSize) }, (_, i) =>
      nameHistory.slice(i * groupSize, (i + 1) * groupSize)
    );

    return this.paginateService.scrollingPagination(
      context,
      groups.map((history, index) => {
        return () =>
          new EmbedBuilder()
            .title((t) => t(`${name} ${t('embeds.namehistory.title')} [${nameHistory.length}]`))
            .description((t) =>
              history
                .map(({ username, changed_at }) => {
                  const time = changed_at
                    ? `<t:${Math.floor(new Date(changed_at).getTime() / 1000)}:R>`
                    : `\`${t('embeds.namehistory.description.originalName')}\``;

                  return `\`•\` **${username}**: ${time}\n`;
                })
                .join('')
            )
            .footer(
              `Page ${index + 1}/${groups.length} • Viewing ${index * groupSize + 1}-${
                index * groupSize + history.length
              }`
            )
            .url(`https://namemc.com/profile/${player.uuid}`)
            .color(INFO_COLOR)
            .thumbnail(thumbURL);
      })
    );
  }
}
