import { existsSync } from 'fs';
import { join } from 'path';

const PATH = '../../assets';
const PRIVATE_PATH = join(PATH, 'private');

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

export const getImagePath = (imagePath: string) => join(PATH, checkAsset(imagePath), imagePath);

/**
 *
 * @param texturePath the path inside of the texture path, it starts already inside of `/assets/minecraft`
 * @returns the full path to the texture
 */
export const getMinecraftTexturePath = (texturePath: string) =>
  join(getImagePath(`minecraft-textures/assets/minecraft/`), texturePath);
