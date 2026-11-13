/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ColorCode, ColorId } from "../color.js";
import { type Color, getColor } from "../color.definition.js";
import type { APIData } from "@statsify/util";

export const RANK_MAP: Record<string, (color: string) => string> = {
  "MVP+": (plusColor) => `§b[MVP${plusColor}+§b]`,
  "MVP++": (plusColor) => `§6[MVP${plusColor}++§6]`,
  "bMVP++": (plusColor) => `§b[MVP${plusColor}++§b]`,
  MVP: () => "§b[MVP]",
  "VIP+": () => "§a[VIP§6+§a]",
  VIP: () => "§a[VIP]",
  YOUTUBE: () => "§c[§fYOUTUBE§c]",
  "PIG+++": () => "§d[PIG§b+++§d]",
  INNIT: () => "§d[INNIT]",
  GM: () => "§2[GM]",
  ADMIN: () => "§c[ADMIN]",
  OWNER: () => "§c[OWNER]",
  STAFF: () => "§c[§6ዞ§c]",
  MOJANG: () => "§6[MOJANG]",
  EVENTS: () => "§6[EVENTS]",
  DEFAULT: () => "§7",
};

export function getPlayerRank(data: APIData) {
  let rank = "DEFAULT";

  if (data.monthlyPackageRank || data.packageRank || data.newPackageRank) {
    if (data.monthlyPackageRank === "SUPERSTAR") {
      rank = data.monthlyPackageRank;

      if (data.monthlyRankColor && data.monthlyRankColor !== "GOLD") {
        rank = "bMVP++";
      }
    } else if (data.newPackageRank && data.newPackageRank !== "NONE") {
      rank = data.newPackageRank;
    } else if (data.packageRank && data.packageRank !== "NONE") {
      rank = data.packageRank;
    }
  }

  if (data.rank && data.rank !== "NORMAL") {
    rank = data.rank;
  }

  if (data.prefix) {
    rank = data.prefix.replaceAll(/§.|\[|]/g, "");
  }

  rank = replaceRank(rank);

  return rank.length === 0 ? "DEFAULT" : rank;
}

const RANK_COLOR_MAP: Record<string, Color> = {
  "MVP+": getColor("RED"),
  "MVP++": getColor("RED"),
  "bMVP++": getColor("RED"),
  MVP: getColor("AQUA"),
  VIP: getColor("GREEN"),
  "VIP+": getColor("GOLD"),
  "PIG+++": getColor("AQUA"),
};

export function getPlusColor(rank: string, plusColor?: ColorId): Color {
  if (plusColor === undefined || rank === "PIG+++" || rank === "VIP") {
    const rankColor: Color = RANK_COLOR_MAP[rank];

    if (!rankColor) return getColor("GRAY");

    return rankColor;
  }

  const rankColor = getColor(plusColor);

  if (!rankColor) return getColor("GRAY");

  return rankColor;
}

export function getRankColor(rank: string): Color {
  switch (rank) {
    case "STAFF":
    case "YOUTUBE":
    case "ADMIN":
    case "OWNER":
    case "SLOTH":
    case "MCP":
    case "MINISTER":
      return getColor("RED");

    case "PIG+++":
    case "INNIT":
      return getColor("LIGHT_PURPLE");

    case "MOD":
    case "GM":
      return getColor("DARK_GREEN");

    case "HELPER":
      return getColor("BLUE");

    case "BUILD TEAM":
      return getColor("DARK_AQUA");

    case "MVP++":
    case "APPLE":
    case "MOJANG":
    case "EVENTS":
      return getColor("GOLD");

    case "MVP":
    case "MVP+":
    case "bMVP++":
      return getColor("AQUA");

    case "VIP":
    case "VIP+":
      return getColor("GREEN");

    default:
      return getColor("GRAY");
  }
}

export function getDisplayName(
  username: string,
  rank: string,
  plusColor: ColorCode,
) {
  const rankFormatter = rank in RANK_MAP ? RANK_MAP[rank] : RANK_MAP.DEFAULT;
  const coloredRank = rankFormatter(plusColor);
  return `${coloredRank}${coloredRank === "§7" ? "" : " "}${username}`;
}

function replaceRank(rank: string) {
  return rank
    .replace("SUPERSTAR", "MVP++")
    .replace("VIP_PLUS", "VIP+")
    .replace("MVP_PLUS", "MVP+")
    .replace("MODERATOR", "MOD")
    .replace("GAME_MASTER", "GM")
    .replace("YOUTUBER", "YOUTUBE")
    .replace("NONE", "");
}
