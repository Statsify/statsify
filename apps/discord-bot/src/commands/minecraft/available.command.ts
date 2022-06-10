import { MojangPlayerArgument } from '#arguments';
import { SUCCESS_COLOR, WARNING_COLOR } from '#constants';
import { MojangApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';

@Command({ description: 'commands.available', args: [new MojangPlayerArgument()] })
export class AvailableCommand {
  public constructor(private readonly mojangApiService: MojangApiService) {}

  public async run(context: CommandContext) {
    const name = context.option<string>('player');

    const nameInfo = await this.mojangApiService.checkName(name.trim());

    if (!nameInfo) {
      const embed = new EmbedBuilder()
        .field((t) => t('embeds.available.description.username'), `\`${name}\``)
        .field(
          (t) => t('embeds.available.description.namemc'),
          `[\`Here\`](https://namemc.com/profile/${name})`
        )
        .field(
          (t) => t('embeds.available.description.status'),
          (t) => `\`${t('available')}*\``
        )
        .footer((t) => `*${t('embeds.available.footer.available')}`)
        .color(SUCCESS_COLOR);

      return {
        embeds: [embed],
      };
    } else {
      const thumbURL = this.mojangApiService.faceIconUrl(nameInfo.uuid);

      const embed = new EmbedBuilder()
        .field((t) => t('embeds.available.description.username'), `\`${name}\``)
        .field(
          (t) => t('embeds.available.description.uuid'),
          `\`${nameInfo.uuid.replace(/-/g, '')}\``
        )
        .field(
          (t) => t('embeds.available.description.namemc'),
          `[\`Here\`](https://namemc.com/profile/${nameInfo.uuid.replace(/-/g, '')})`
        )
        .field(
          (t) => t('embeds.available.description.status'),
          (t) => `\`${t('unavailable')}\``
        )
        .color(WARNING_COLOR)
        .thumbnail(thumbURL);

      return {
        embeds: [embed],
      };
    }
  }
}
