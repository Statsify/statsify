import { getMinecraftTexturePath } from '@statsify/assets';
import { FontRenderer } from '@statsify/jsx';
import Container from 'typedi';

const renderer = new FontRenderer();

export const loadFont = async () => {
  await renderer.loadImages(getMinecraftTexturePath('textures/font'));
};

Container.set(FontRenderer, renderer);
