import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { MojangApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';

@Command({ description: 'commands.namehistory', args: [new MojangPlayerArgument()] })
export class NameHistoryCommand {
  public constructor(private readonly mojangApiService: MojangApiService) {}

  public async run(context: CommandContext) {
    const player = await this.mojangApiService.getPlayer(context.option('player'));
    const thumbURL = this.mojangApiService.faceIconUrl(player.uuid);
    const nameHistory = player.username_history;

    const name = `${player.username}${player.username.slice(-1) == "s'" ? "'" : "'s"}`;

    const embed = new EmbedBuilder()
      .title((t) => t(`${name} ${t('embeds.namehistory.title')} [${nameHistory.length}]`))
      .description((t) =>
        nameHistory
          .reverse()
          .map(({ username, changed_at }) => {
            const time = changed_at
              ? `<t:${Math.floor(new Date(changed_at).getTime() / 1000)}:R>`
              : `\`${t('embeds.namehistory.description.originalName')}\``;

            return `\`•\` **${username}**: ${time}\n`;
          })
          .join('')
      )
      .url(`https://namemc.com/profile/${player.uuid}`)
      .color(INFO_COLOR)
      .thumbnail(thumbURL);

    return {
      embeds: [embed],
    };
  }
}
