/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Color, ColorCode } from "./april-fools-color";
import { minecraftColors } from "./minecraft-colors";
import { pseudoRandomBytes } from "node:crypto";
/*
      case "SLOTH":
      case "MCP":
      case "MINISTER":
      case "MOD":
      case "HELPER":
      case "BUILD TEAM":
      case "APPLE":
*/

export const rankMap: Record<string, (color: string) => string> = {
  "MVP+": (plusColor) => `§b[MVP${plusColor}+§b]`,
  "MVP++": (plusColor) => `§6[MVP${plusColor}++§6]`,
  "bMVP++": (plusColor) => `§b[MVP${plusColor}++§b]`,
  MVP: () => "§b[MVP]",
  "VIP+": () => `§a[VIP§6+§a]`,
  VIP: () => `§a[VIP]`,
  YOUTUBE: () => `§c[§fYOUTUBE§c]`,
  "PIG+++": () => `§d[PIG§b+++§d]`,
  GM: () => "§2[GM]",
  ADMIN: () => `§c[ADMIN]`,
  OWNER: () => `§c[OWNER]`,
  MOJANG: () => `§6[MOJANG]`,
  EVENTS: () => `§6[EVENTS]`,
  DEFAULT: () => `§7`,
};

/**
 * A set of utility functions for getting things like `rank`, `displayName` and `plusColor`
 */
const rankMapKeys = Object.keys(rankMap);

export const getRank = () => {
  const maxBytes = Math.ceil(Math.log2(rankMapKeys.length) / 8);

  let randomNumber = 0;
  do {
    const buffer = pseudoRandomBytes(maxBytes);
    const excessBytes = buffer.length - maxBytes;

    if (excessBytes > 0) buffer.copy(buffer, excessBytes);
    randomNumber = buffer.readUIntBE(0, maxBytes);
  } while (randomNumber >= rankMapKeys.length);

  return rankMapKeys[randomNumber];
};

export const getPlusColor = (rank: string): Color => {
  const rankColorMap: Record<string, Color> = {
    "MVP+": new Color("RED"),
    "MVP++": new Color("RED"),
    "bMVP++": new Color("RED"),
    MVP: new Color("AQUA"),
    VIP: new Color("GREEN"),
    "VIP+": new Color("GOLD"),
    "PIG+++": new Color("AQUA"),
  };

  return rank.includes("MVP+")
    ? new Color(
        minecraftColors.map((color) => color.id)[
          Math.floor(Math.random() * minecraftColors.length)
        ]
      )
    : rankColorMap[rank] || new Color("GRAY");
};

export const getRankColor = (rank: string): Color => {
  switch (rank) {
    case "YOUTUBE":
    case "ADMIN":
    case "OWNER":
    case "SLOTH":
    case "MCP":
    case "MINISTER":
      return new Color("RED");

    case "PIG+++":
      return new Color("LIGHT_PURPLE");

    case "MOD":
    case "GM":
      return new Color("DARK_GREEN");

    case "HELPER":
      return new Color("BLUE");

    case "BUILD TEAM":
      return new Color("DARK_AQUA");

    case "MVP++":
    case "APPLE":
    case "MOJANG":
      return new Color("GOLD");

    case "MVP":
    case "MVP+":
    case "bMVP++":
      return new Color("AQUA");

    case "VIP":
    case "VIP+":
      return new Color("GREEN");

    default:
      return new Color("GRAY");
  }
};

export const getDisplayName = (username: string, rank: string, plusColor: ColorCode) => {
  const colorRank = rankMap[rank](plusColor);
  return `${colorRank}${colorRank === "§7" ? "" : " "}${username}`;
};

export const aprilFoolify = (player: any, setRank = true) => {
  const randomRank = getRank();

  if (setRank) player.rank = getRank();
  player.plusColor = getPlusColor(randomRank); //!
  player.prefixName = `${getRankColor(randomRank).toString()}${player.username}`;
  player.displayName = getDisplayName(player.username, randomRank, player.plusColor.code);

  return player;
};

export const fisherYates = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};
