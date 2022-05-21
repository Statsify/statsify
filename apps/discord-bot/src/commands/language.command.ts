import { Command, CommandContext, EmbedBuilder, IMessage } from '@statsify/discord';

@Command({ description: 'Language testing' })
export class LanguageCommand {
  public run(context: CommandContext): IMessage {
    const embed = new EmbedBuilder()
      .title((t) => t('games.bedwars'))
      .field((t) => t('stats.wins'), 1280.11)
      .field((t) => t('stats.losses'), 128)
      .field((t) => t('stats.kills'), 1)
      .field((t) => t('stats.deaths'), 12.333)
      .field((t) => t('stats.assists'), 0.2222)
      .color(0x00ff00);

    return {
      content: `\`${context.getInteraction().getLocale()}\``,
      embeds: [embed],
    };
  }
}
