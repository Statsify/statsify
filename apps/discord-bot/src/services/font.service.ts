import { getMinecraftTexturePath } from '@statsify/assets';
import { FontRenderer } from '@statsify/jsx';
import Container from 'typedi';

const renderer = new FontRenderer();

Container.set(FontRenderer, renderer);

export class FontService {
  public static async init() {
    await renderer.loadImages(getMinecraftTexturePath('textures/font'));
  }
}
