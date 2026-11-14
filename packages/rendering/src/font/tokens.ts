/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { minecraftColors } from "@statsify/util";
import type { Fill } from "#jsx";

export interface TextNode {
  text: string;
  color: Fill;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  size: number;
}

export interface Token {
  regex: RegExp;
  effect: (
    part: string,
    matches: RegExpMatchArray,
    defaultState: Omit<TextNode, "text">,
  ) => Partial<TextNode>;
}

const bold: Token = { regex: /^l/i, effect: () => ({ bold: true }) };

const italic: Token = {
  regex: /^o/i,
  effect: () => ({ italic: true }),
};

const underline: Token = {
  regex: /^n|^u/i,
  effect: () => ({ underline: true }),
};

const strikethrough: Token = {
  regex: /^m/i,
  effect: () => ({ strikethrough: true }),
};

const obfuscated: Token = {
  regex: /^k/i,
  effect: () => ({}),
};

const reset: Token = {
  regex: /^r/i,
  effect: (_, __, defaultState) => defaultState,
};

const minecraftColorList = minecraftColors.map((color) => [
  color.code.replace("§", ""),
  color.hex,
]);

const textColors = Object.fromEntries(minecraftColorList);

const colorRegex = new RegExp(
  `^${Object.keys(textColors).join("|^")}|^#([A-Fa-f0-9]{6})`,
  "i"
);

const color: Token = {
  regex: colorRegex,
  effect: (part) => ({
    color: part.startsWith("#") ? part.slice(0, 7) : textColors[part[0].toLowerCase()],
  }),
};

const size: Token = {
  regex: /^\^\d\^/,
  effect: (_, [match]) => ({
    size: Number.parseInt(match.slice(1, -1)),
  }),
};

export const tokens: Token[] = [
  color,
  bold,
  reset,
  size,
  italic,
  underline,
  strikethrough,
  obfuscated,
];
