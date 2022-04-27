import { Logger } from '@statsify/logger';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const hasRequiredAssets = () => {
  const logger = new Logger('@statsify/assets');
  let missing = false;

  if (!existsSync('../../assets/minecraft-textures')) {
    logger.error('Add a 1.8.9 texture pack to assets/minecraft-textures');
    missing = true;
  }

  if (!existsSync('../../assets/logos')) {
    logger.error('Add statsify logos to assets/logos');
    missing = true;
  }

  if (missing) throw new Error('Missing assets');
};

let hasPrivateAssets = false;

const checkPrivateAssets = () => {
  if (hasPrivateAssets) return hasPrivateAssets;

  try {
    const file = readFileSync('../../assets/package.json');

    hasPrivateAssets = !!file;

    hasRequiredAssets();

    return !!hasPrivateAssets;
  } catch {
    hasRequiredAssets();

    return false;
  }
};

/**
 *
 * @param file the path to the asset
 * @description If the user does not have access to assets, this function will always return null
 * @returns the asset if available, otherwise null
 */
export const importAsset = async <T>(file: string): Promise<T | null> => {
  if (!checkPrivateAssets()) return null;

  return import(join('../../../assets/', file));
};

/**
 *
 * @param texturePath the path inside of the texture path, it starts already inside of `/assets/minecraft`
 * @returns the full path to the texture
 */
export const getMinecraftTexturePath = (texturePath: string) => {
  return join(getImagePath(`minecraft-textures/assets/minecraft/`), texturePath);
};

export const getImagePath = (imagePath: string) => {
  checkPrivateAssets();
  return join(`../../assets/`, imagePath);
};
