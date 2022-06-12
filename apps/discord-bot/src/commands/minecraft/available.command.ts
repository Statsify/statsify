import { MojangPlayerArgument } from '#arguments';
import { MojangApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';

@Command({ description: 'commands.available', args: [new MojangPlayerArgument()] })
export class AvailableCommand {
  public constructor(private readonly mojangApiService: MojangApiService) {}

  public async run(context: CommandContext) {
    const name = context.option<string>('player');

    if (!name.match(/^\w+$/i)) {
      return {
        embeds: [
          new EmbedBuilder()
            .field((t) => t('embeds.available.description.username'), `\`${name}\``)
            .field(
              (t) => t('embeds.available.description.status'),
              (t) => `\`${t('embeds.available.description.invalidCharacters')}\``
            )
            .color(0xb76ba3),
        ],
      };
    } else if (name.length > 16) {
      return {
        embeds: [
          new EmbedBuilder()
            .field((t) => t('embeds.available.description.username'), `\`${name}\``)
            .field(
              (t) => t('embeds.available.description.status'),
              (t) => `\`${t('embeds.available.description.tooLong')}\``
            )
            .color(0xb76ba3),
        ],
      };
    }

    const nameInfo = await this.mojangApiService.checkName(name.trim());

    if (!nameInfo) {
      return {
        embeds: [
          new EmbedBuilder()
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
            .color(0x00a28a),
        ],
      };
    } else {
      return {
        embeds: [
          new EmbedBuilder()
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
            .color(0xf7c46c)
            .thumbnail(this.mojangApiService.faceIconUrl(nameInfo.uuid)),
        ],
      };
    }
  }
}
