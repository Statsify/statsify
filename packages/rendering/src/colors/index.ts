export type RGB = [number, number, number];

export type RGBA = [number, number, number, number];

export const hexToRgb = (hex: string): RGB => {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const color = [r, g, b];

  if (hex.length === 8) {
    const a = parseInt(hex.substring(6, 8), 16);
    color.push(a / 256);
  }

  return color as unknown as RGB;
};

export const rgbToHex = (rgb: RGB | RGBA): string =>
  '#' + rgb.map((o) => o.toString(16).toUpperCase().padStart(2, '0')).join('');

export const mcShadow = (rgb: RGB): RGB => rgb.map((o) => Math.floor(o * 0.25)) as RGB;

export const parseColor = (color: string): RGBA => {
  if (color.startsWith('#')) {
    return hexToRgb(color) as unknown as RGBA;
  } else if (color.startsWith('rgb') || color.startsWith('rgba')) {
    return color
      .split('(')[1]
      .split(')')[0]
      .split(',')
      .map((o) => +o) as RGBA;
  } else {
    return [0, 0, 0, 0];
  }
};
