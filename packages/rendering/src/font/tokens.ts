/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { winterMinecraftColors } from "@statsify/util";
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
    defaultState: Omit<TextNode, "text">
  ) => Partial<TextNode>;
}

const bold: Token = { regex: /^l/, effect: () => ({ bold: true }) };

const italic: Token = {
  regex: /^o/,
  effect: () => ({ italic: true }),
};

const underline: Token = {
  regex: /^n|^u/,
  effect: () => ({ underline: true }),
};

const strikethrough: Token = {
  regex: /^m/,
  effect: () => ({ strikethrough: true }),
};

const obfuscated: Token = {
  regex: /^k/,
  effect: () => ({}),
};

const reset: Token = {
  regex: /^r/,
  effect: (_, __, defaultState) => defaultState,
};

const minecraftColorList = winterMinecraftColors.map((color) => [
  color.code.replace("§", ""),
  color.hex,
]);

const textColors = Object.fromEntries(minecraftColorList);

const colorRegex = new RegExp(
  `^${Object.keys(textColors).join("|^")}|^#([A-Fa-f0-9]{6})`
);

const color: Token = {
  regex: colorRegex,
  effect: (part) => ({
    color: part.startsWith("#") ? part.slice(0, 7) : textColors[part[0]],
    strikethrough: false,
    underline: false,
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
