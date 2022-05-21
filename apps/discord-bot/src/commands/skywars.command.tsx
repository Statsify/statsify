import { Command, CommandContext } from '@statsify/discord';
import { FontRenderer, JSX } from '@statsify/jsx';
import { Canvas } from 'skia-canvas';
import Container from 'typedi';
import { PlayerArgument } from '../arguments';
import { SkyWarsProfile } from '../profiles/skywars.profile';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Displays this message.',
  args: [PlayerArgument],
  cooldown: 5,
})
export class SkyWarsCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const player = await this.apiService.getPlayer(context.option('player'), context.getUser());
    const skin = await this.apiService.getPlayerSkin(player.uuid);

    const width = 860;
    const height = 750;

    const canvas = new Canvas(width, height);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, width, height);

    const modes = ['overall'] as const;

    const images = await Promise.all(
      modes.map((mode) => {
        const canvas = new Canvas(width, height);

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, width, height);

        const instructions = JSX.createInstructions(
          <SkyWarsProfile
            player={player}
            skin={skin}
            mode={mode}
            width={width}
            height={height}
            t={context.t()}
          />,
          canvas.width,
          canvas.height
        );

        return JSX.createRender(canvas, instructions, {
          renderer: Container.get(FontRenderer),
        }).toBuffer('png');
      })
    );

    return {
      files: images.map((image) => ({ name: 'image.png', data: image, type: 'image/png' })),
    };
  }
}
