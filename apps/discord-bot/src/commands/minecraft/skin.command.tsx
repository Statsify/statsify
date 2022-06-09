import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { ApiService } from '#services';
import {
  ActionRowBuilder,
  ButtonBuilder,
  Command,
  CommandContext,
  EmbedBuilder,
} from '@statsify/discord';
import { Canvas } from 'skia-canvas/lib';

@Command({ description: 'commands.skin', args: [new MojangPlayerArgument()] })
export class SkinCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayer,
      context.option('player')
    );

    const applyURL = `https://www.minecraft.net/en-us/profile/skin/remote?url=https://visage.surgeplay.com/skin/${player.uuid}`;

    const skin = await this.apiService.getPlayerSkin(player.uuid);
    const canvas = new Canvas(skin.width, skin.height);
    canvas.getContext('2d').drawImage(skin, 0, 0);

    const embed = new EmbedBuilder()
      .field((t) => t('embeds.skin.description.username'), `\`${player.username}\``)
      .color(INFO_COLOR)
      .image(`attachment://skin.png`);

    const button = new ButtonBuilder()
      .style(5)
      .url(applyURL)
      .label((t) => t('embeds.skin.components.apply'));

    const buttons = new ActionRowBuilder().component(button);

    return {
      embeds: [embed],
      files: [{ data: await canvas.toBuffer('png'), name: 'skin.png', type: 'image/png' }],
      components: [buttons],
    };
  }
}
