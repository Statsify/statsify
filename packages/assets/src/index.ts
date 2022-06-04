import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { Image, loadImage } from 'skia-canvas';

const PATH = '../../assets';
const PRIVATE_PATH = join(PATH, 'private', 'package.json');

const hasPrivateAssets = existsSync(PRIVATE_PATH);

const checkAsset = (file: string) =>
  hasPrivateAssets && existsSync(join(PRIVATE_PATH, file)) ? 'private' : 'public';

/**
 *
 * @param file the path to the asset
 * @description If the user does not have access to assets, this function will always return null
 * @returns the asset if available, otherwise null
 */
export const importAsset = async <T>(file: string): Promise<T | null> => {
  if (checkAsset(file.endsWith('.js') ? file : `${file}.js`) === 'public') return null;
  return import(join('../', PRIVATE_PATH, file));
};

export const getAssetPath = (path: string) => join(PATH, checkAsset(path), path);

export const getImage = (path: string) => loadImage(getAssetPath(path));

/**
 *
 * @param texturePath the path inside of the texture path, it starts already inside of `/assets/minecraft`
 * @returns the full path to the texture
 */
export const getMinecraftTexturePath = (texturePath: string) =>
  join(getAssetPath(`minecraft-textures/assets/minecraft/`), texturePath);

let backgrounds: string[] = [];

function getBackgroundPaths() {
  if (backgrounds.length) return backgrounds;
  backgrounds = readdirSync(getAssetPath('out/backgrounds'));
  return backgrounds;
}

export function getBackground(path: string): Promise<Image>;
export function getBackground(game: string, mode: string): Promise<Image>;
export function getBackground(pathOrGame: string, mode?: string): Promise<Image> {
  if (!hasPrivateAssets) return getImage('out/backgrounds/background.png');

  if (typeof mode === 'string') {
    const path = `${pathOrGame}_${mode}_`;
    const backgrounds = getBackgroundPaths().filter((p) => p.startsWith(path));
    const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    return getImage(`out/backgrounds/${background}`);
  }

  return getImage(`out/backgrounds/${pathOrGame}.png`);
}

export const getLogo = (premium = false, size = 26) =>
  getImage(`logos/${premium ? 'premium_' : ''}logo_${size}.png`);
