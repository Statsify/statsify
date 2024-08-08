/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { User, UserLogo } from "@statsify/schemas";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadImage } from "@statsify/rendering";
import type { Image } from "skia-canvas";

const PATH = "../../assets";
const PRIVATE_PATH = join(PATH, "private");

const hasPrivateAssets = existsSync(join(PRIVATE_PATH, "package.json"));

const checkAsset = (file: string) =>
  hasPrivateAssets && existsSync(join(PRIVATE_PATH, file)) ? "private" : "public";

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

export const getAllGameIcons = async () => {
  const gameIconPaths = readdirSync(getAssetPath("games"));

  const gameIconsRequest = await Promise.all(
    gameIconPaths.map(async (g) => [g.replace(".png", ""), await getImage(`games/${g}`)])
  );

  return Object.fromEntries(gameIconsRequest);
};

let backgrounds: string[] = [];

function getBackgroundPaths() {
  if (backgrounds.length > 0) return backgrounds;
  backgrounds = readdirSync(getAssetPath("out/backgrounds"));
  return backgrounds;
}

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

export function getLogo(
  userOrLogoOrPath: User | UserLogo | string | null,
  size?: number
): Promise<Image> {
  return loadImage(getLogoPath(userOrLogoOrPath as User, size));
}

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

    case UserLogo.PINK:
      path = "pink_";
      break;

    case UserLogo.VENOM:
      path = "venom_";
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
