import { MojangPlayerArgument } from '#arguments';
import { AshconResponse, MojangApiService, PaginateService } from '#services';
import { Command, CommandContext } from '@statsify/discord';
import { Canvas, Image, loadImage } from 'skia-canvas';
import { ErrorMessage } from '../../error.message';

@Command({ description: (t) => t('commands.cape'), args: [MojangPlayerArgument] })
export class CapeCommand {
  public constructor(
    private readonly mojangApiService: MojangApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.mojangApiService.getWithUser(
      user,
      this.mojangApiService.getPlayer,
      context.option<string>('player')
    );

    const capes = await Promise.all([
      this.getOptifineCape(player.username),
      this.getMojangCape(player),
    ]);

    const pages = capes
      .filter((c) => !!c.image)
      .map((c) => ({ label: c.label, generator: () => this.renderCape(c.image as Image) }));

    if (!pages.length)
      return new ErrorMessage(
        (t) => t('errors.noCape.title'),
        (t) => t('errors.noCape.description')
      );

    return this.paginateService.paginate(context, pages);
  }

  private async getOptifineCape(username: string) {
    return {
      label: 'Optifine',
      image: await loadImage(`http://s.optifine.net/capes/${username}.png`).catch(() => null),
    };
  }

  private async getMojangCape(player: AshconResponse) {
    const image = player.textures.cape?.url
      ? await loadImage(player.textures.cape.url).catch(() => null)
      : null;

    return { label: 'Mojang', image };
  }

  private renderCape(cape: Image) {
    const canvas = new Canvas(636, 1024);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let height: number;
    let width: number;
    let start: number;

    switch (cape.width) {
      case 92: {
        height = 32;
        width = 20;
        start = 2;
        break;
      }
      case 184: {
        height = 64;
        width = 40;
        start = 4;
        break;
      }
      case 1024: {
        height = 256;
        width = 160;
        start = 16;
        break;
      }
      case 2048: {
        height = 512;
        width = 318;
        start = 12;
        break;
      }
      default:
      case 46: {
        height = 16;
        width = 10;
        start = 1;
        break;
      }
    }

    const ratio = Math.min(canvas.width / width, canvas.height / height);

    ctx.drawImage(
      cape,
      start,
      start,
      cape.width,
      cape.height,
      0,
      0,
      cape.width * ratio,
      cape.height * ratio
    );

    return canvas;
  }
}
