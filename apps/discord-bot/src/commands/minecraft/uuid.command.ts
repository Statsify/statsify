import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { ApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';

@Command({ description: 'commands.uuid', args: [new MojangPlayerArgument()] })
export class UUIDCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayer,
      context.option('player')
    );

    const thumbURL = `https://crafatar.com/avatars/${player.uuid}?size=160&default=MHF_Steve&overlay&id=c958a4c0ca23485299ffc2cab67aea3e`;

    const embed = new EmbedBuilder()
      .field((t) => t('embeds.uuid.description.username'), `\`${player.username}\``)
      .field((t) => t('embeds.uuid.description.uuid'), `\`${player.uuid}\``)
      .field(
        (t) => t('embeds.uuid.description.shortUUID'),
        `${player.shortUuid.replace(/`/g, '\\`')}`
      )
      .color(INFO_COLOR)
      .thumbnail(thumbURL);

    return {
      embeds: [embed],
    };
  }
}
