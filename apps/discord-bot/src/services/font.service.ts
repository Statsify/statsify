import { getMinecraftTexturePath } from '@statsify/assets';
import { FontRenderer } from '@statsify/jsx';
import Container from 'typedi';

const renderer = new FontRenderer();
const hdRenderer = new FontRenderer();

export const loadFont = async () => {
  await renderer.loadImages(getMinecraftTexturePath('textures/font'));
  await hdRenderer.loadImages(`../../assets/hd-pack/assets/minecraft/textures/font`);
};

Container.set(FontRenderer, renderer);
Container.set('HD_RENDERER', hdRenderer);
