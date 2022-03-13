import { readFileSync } from 'fs';
import { join } from 'path';

let hasAssets = false;

const checkAssets = () => {
  if (hasAssets) return hasAssets;

  const file = readFileSync('../../assets/renovate.json');

  hasAssets = !!file;

  return !!hasAssets;
};

/**
 *
 * @param file the path to the asset
 * @description If the user does not have access to assets, this function will always return null
 * @returns the asset if available, otherwise null
 */
export const importAsset = async <T>(file: string): Promise<T | null> => {
  if (!checkAssets()) return null;

  return import(join('../../../assets/', file));
};
