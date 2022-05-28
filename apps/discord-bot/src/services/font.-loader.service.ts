import { getMinecraftTexturePath } from '@statsify/assets';
import { FontRenderer } from '@statsify/rendering';
import Container, { Service } from 'typedi';

const renderer = new FontRenderer();

Container.set(FontRenderer, renderer);

@Service()
export class FontLoaderService {
  public async init() {
    await renderer.loadImages(getMinecraftTexturePath('textures/font'));
  }
}
