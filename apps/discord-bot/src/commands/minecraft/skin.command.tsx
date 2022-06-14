import { MojangPlayerArgument } from '#arguments';
import { INFO_COLOR } from '#constants';
import { ApiService, MojangApiService } from '#services';
import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';
import { Canvas } from 'skia-canvas/lib';

@Command({ description: 'commands.skin', args: [MojangPlayerArgument] })
export class SkinCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly mojangApiService: MojangApiService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.mojangApiService.getWithUser(
      user,
      this.mojangApiService.getPlayer,
      context.option<string>('player')
    );

    const skin = await this.apiService.getPlayerSkin(player.uuid);
    const canvas = new Canvas(skin.width, skin.height);
    canvas.getContext('2d').drawImage(skin, 0, 0);

    const embed = new EmbedBuilder()
      .field((t) => t('embeds.skin.description.username'), `\`${player.username}\``)
      .color(INFO_COLOR)
      .image(`attachment://skin.png`);

    return {
      embeds: [embed],
      files: [{ data: await canvas.toBuffer('png'), name: 'skin.png', type: 'image/png' }],
    };
  }
}
