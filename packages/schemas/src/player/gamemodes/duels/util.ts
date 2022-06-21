/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Color } from "../../../color";
import { findScore, removeFormatting, romanNumeral } from "@statsify/util";

export const getTitle = (wins: number, prefix: string) => {
  const isOverall = prefix === "";
  prefix = prefix ? `${prefix} ` : prefix;

  const titleScores = [
    { req: 0, inc: 0, title: "None", color: new Color("GRAY") },
    { req: 50, inc: 10, title: "Rookie", color: new Color("DARK_GRAY") },
    { req: 100, inc: 30, title: "Iron", color: new Color("WHITE") },
    { req: 250, inc: 50, title: "Gold", color: new Color("GOLD") },
    { req: 500, inc: 100, title: "Diamond", color: new Color("DARK_AQUA") },
    { req: 1000, inc: 200, title: "Master", color: new Color("DARK_GREEN") },
    {
      req: 2000,
      inc: 600,
      title: "Legend",
      color: new Color("DARK_RED"),
      bold: true,
    },
    {
      req: 5000,
      inc: 1000,
      title: "Grandmaster",
      color: new Color("YELLOW"),
      bold: true,
    },
    {
      req: 10_000,
      inc: 3000,
      title: "Godlike",
      color: new Color("DARK_PURPLE"),
      bold: true,
    },
    {
      req: 25_000,
      inc: 5000,
      title: "World Elite",
      color: new Color("AQUA"),
      semi: true,
    },
    {
      req: 50_000,
      inc: 10_000,
      title: "World Master",
      color: new Color("LIGHT_PURPLE"),
      semi: true,
    },
    {
      req: 100_000,
      inc: 10_000,
      max: 50,
      title: "World's Best",
      color: new Color("GOLD"),
      semi: true,
    },
  ].map((data) => ({
    ...data,
    req: data.req * (isOverall ? 2 : 1),
    inc: data.inc * (isOverall ? 2 : 1),
  }));

  const {
    req,
    inc,
    title,
    color,
    bold = false,
    semi = false,
    max,
  } = findScore(titleScores, wins);

  const remaining = wins - req;
  let index = (inc ? Math.floor(remaining / inc) : inc) + 1;

  index = max ? Math.min(index, max) : index;

  const formatted = `${bold ? "§l" : ""}${color.code}${prefix}${
    semi ? "§l" : ""
  }${title}${index > 1 ? ` ${romanNumeral(index)}` : ""}§r`;

  return {
    formatted,
    color,
    raw: removeFormatting(formatted),
  };
};
