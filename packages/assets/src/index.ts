/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Image } from "skia-canvas";
import { User, UserLogo } from "@statsify/schemas";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadImage } from "@statsify/rendering";

const PATH = "../../assets";
const PRIVATE_PATH = join(PATH, "private");

const hasPrivateAssets = existsSync(join(PRIVATE_PATH, "package.json"));

const checkAsset = (file: string) =>
  hasPrivateAssets && existsSync(join(PRIVATE_PATH, file)) ? "private" : "public";

/**
 *
 * @param file the path to the asset
 * @description If the user does not have access to assets, this function will always return null
 * @returns the asset if available, otherwise null
 */
export const importAsset = async <T>(file: string): Promise<T | null> => {
  if (checkAsset(file.endsWith(".js") ? file : `${file}.js`) === "public") return null;
  return import(join("../", PRIVATE_PATH, file));
};

export const getAssetPath = (path: string) => join(PATH, checkAsset(path), path);

export const getImage = (path: string) => loadImage(getAssetPath(path));

/**
 *
 * @param texturePath the path inside of the texture path, it starts already inside of `/assets/minecraft`
 * @param pack default
 * @returns the full path to the texture
 */
export const getMinecraftTexturePath = (texturePath: string, pack = "default") => {
  if (!hasPrivateAssets) pack = "default";
  return join(getAssetPath(`minecraft-textures/${pack}/assets/minecraft/`), texturePath);
};

let backgrounds: string[] = [];

function getBackgroundPaths() {
  if (backgrounds.length) return backgrounds;
  backgrounds = readdirSync(getAssetPath("out/backgrounds"));
  return backgrounds;
}

export function getBackground(path: string): Promise<Image>;
export function getBackground(game: string, mode: string): Promise<Image>;
export function getBackground(pathOrGame: string, mode?: string): Promise<Image> {
  if (!hasPrivateAssets) return getImage("out/backgrounds/background.png");

  if (typeof mode === "string") {
    const path = `${pathOrGame}_${mode}_`;
    const backgrounds = getBackgroundPaths().filter((p) => p.startsWith(path));

    const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    if (!background) throw new Error(`No background found for ${pathOrGame}_${mode}`);

    return getImage(`out/backgrounds/${background}`);
  }

  return getImage(`out/backgrounds/${pathOrGame}.png`);
}

export const getServerMappings = () =>
  JSON.parse(readFileSync("../../assets/server-mappings/servers.json", "utf8")) as {
    id: string;
    name: string;
    addresses: string[];
  }[];

export function getLogo(user: User | null, size?: number): Promise<Image>;
export function getLogo(logo: UserLogo | null, size?: number): Promise<Image>;
export function getLogo(
  userOrLogo: User | UserLogo | null,
  size?: number
): Promise<Image> {
  return loadImage(getLogoPath(userOrLogo as User, size));
}

export function getLogoPath(user: User | null, size?: number): string;
export function getLogoPath(logo: UserLogo | null, size?: number): string;
export function getLogoPath(path: string, size?: number): string;
export function getLogoPath(
  userOrLogoOrPath: User | UserLogo | string | null,
  size = 26
): string {
  let path: string | undefined;
  let logo: UserLogo | undefined;

  switch (typeof userOrLogoOrPath) {
    case "string":
      path = `${userOrLogoOrPath}_`;
      break;
    case "object":
      logo = User.getLogo(userOrLogoOrPath);
      break;
    case "number":
      logo = userOrLogoOrPath;
      break;
  }

  switch (logo) {
    case UserLogo.RUBY:
      path = "ruby_";
      break;
    case UserLogo.AMETHYST:
      path = "amethyst_";
      break;
    case UserLogo.NETHERITE:
      path = "netherite_";
      break;
    case UserLogo.SCULK:
      path = "sculk_";
      break;
    case UserLogo.EMERALD:
      path = "emerald_";
      break;
    case UserLogo.DIAMOND:
      path = "diamond_";
      break;
    case UserLogo.GOLD:
      path = "gold_";
      break;
    case UserLogo.IRON:
      path = "iron_";
      break;
    case UserLogo.DEFAULT:
      path = "";
      break;
  }

  if (path === undefined) throw new Error("Invalid logo path");

  return getAssetPath(`logos/${path}logo_${size}.png`);
}
