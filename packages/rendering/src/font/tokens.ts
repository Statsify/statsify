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
  effect: (
    part: string,
    matches: RegExpMatchArray,
    defaultState: Omit<TextNode, 'text'>
  ) => Partial<TextNode>;
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
  effect: (_, __, defaultState) => defaultState,
};

const textColors = Object.fromEntries(
  minecraftColors.map((color) => [color.code.replace('§', ''), hexToRgb(color.hex)])
);

const colorRegex = new RegExp(`^${Object.keys(textColors).join('|^')}|^#([A-Fa-f0-9]{6})`);

const color: Token = {
  regex: colorRegex,
  effect: (part) => ({ color: part.startsWith('#') ? hexToRgb(part) : textColors[part[0]] }),
};

const size: Token = {
  regex: /^\^\d\^/,
  effect: (_, [match]) => ({
    size: parseInt(match.substring(1, match.length - 1)),
  }),
};

export const tokens: Token[] = [color, bold, reset, size, italic, underline];
