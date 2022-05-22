import { minecraftColors } from '@statsify/util';
import { hexToRgb, RGB } from '../colors';

export interface TextNode {
  text: string;
  color: RGB;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  size: number;
  shadow: boolean;
}

export interface Token {
  regex: RegExp;
  effect: (part: string, matches: RegExpMatchArray) => Partial<TextNode>;
}

const bold: Token = { regex: /^l/, effect: () => ({ bold: true }) };

const italic: Token = {
  regex: /^o/,
  effect: () => ({ italic: true }),
};

const underline: Token = {
  regex: /^u/,
  effect: () => ({ underline: true }),
};

const reset: Token = {
  regex: /^r/,
  effect: () => ({
    italic: false,
    bold: false,
    underline: false,
    color: [255, 255, 255],
    size: 2,
  }),
};

const textColors = Object.fromEntries(
  minecraftColors.map((color) => [color.code.replace('§', ''), hexToRgb(color.hex)])
);

const colorRegex = new RegExp(`^${Object.keys(textColors).join('|^')}`);

const color: Token = {
  regex: colorRegex,
  effect: (part) => ({ color: textColors[part[0]] }),
};

const size: Token = {
  regex: /^\^\d\^/,
  effect: (_, [match]) => ({
    size: parseInt(match.substring(1, match.length - 1)),
  }),
};

export const tokens: Token[] = [color, bold, reset, size, italic, underline];
