import { getMinecraftTexturePath } from '@statsify/assets';
import { FontRenderer } from '@statsify/rendering';
import Container, { Service } from 'typedi';

const renderer = new FontRenderer();
const hdRenderer = new FontRenderer();

Container.set(FontRenderer, renderer);
Container.set('HDFontRenderer', hdRenderer);

@Service()
export class FontLoaderService {
  public async init() {
    await renderer.loadImages(getMinecraftTexturePath('textures/font'));
    await hdRenderer.loadImages(getMinecraftTexturePath('textures/font', 'hd'));
  }
}
