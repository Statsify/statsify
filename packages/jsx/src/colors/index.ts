export const matchHex = (hex: string): RegExpExecArray =>
  <RegExpExecArray>/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

export type RGB = [number, number, number];

export const hexToRgb = (hex: string): RGB =>
  matchHex(hex)!
    .slice(1)
    .map((o) => parseInt(o, 16)) as RGB;

export const mcShadow = (rgb: RGB): RGB => rgb.map((o) => Math.floor(o * 0.25)) as RGB;
