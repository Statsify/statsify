import { Field } from './metadata';

export const colors = [
  { code: '§0', hex: '#000000', id: 'BLACK' },
  { code: '§1', hex: '#0000AA', id: 'DARK_BLUE' },
  { code: '§2', hex: '#00AA00', id: 'DARK_GREEN' },
  { code: '§3', hex: '#00AAAA', id: 'DARK_AQUA' },
  { code: '§4', hex: '#AA0000', id: 'DARK_RED' },
  { code: '§5', hex: '#AA00AA', id: 'DARK_PURPLE' },
  { code: '§6', hex: '#FFAA00', id: 'GOLD' },
  { code: '§7', hex: '#BAB6B6', id: 'GRAY' },
  { code: '§8', hex: '#555555', id: 'DARK_GRAY' },
  { code: '§9', hex: '#5555FF', id: 'BLUE' },
  { code: '§a', hex: '#55FF55', id: 'GREEN' },
  { code: '§b', hex: '#55FFFF', id: 'AQUA' },
  { code: '§c', hex: '#FF5555', id: 'RED' },
  { code: '§d', hex: '#FF55FF', id: 'LIGHT_PURPLE' },
  { code: '§e', hex: '#FFFF55', id: 'YELLOW' },
  { code: '§f', hex: '#F2F2F2', id: 'WHITE' },
] as const;

export type ColorCode = typeof colors[number]['code'];

export type ColorHex = typeof colors[number]['hex'];

/**
 * The name of the color in all caps
 */
export type ColorId = typeof colors[number]['id'];

export class Color {
  @Field({
    docs: {
      enum: colors.map((c) => c.code),
      enumName: 'ColorCode',
      examples: [colors[0].code],
      description: 'A Minecraft color code',
    },
    type: () => String,
  })
  public code: ColorCode;

  @Field({
    docs: {
      enum: colors.map((c) => c.hex),
      enumName: 'ColorHex',
      examples: [colors[0].hex],
      description: 'A hex color code',
    },
    type: () => String,
  })
  public hex: ColorHex;

  @Field({
    docs: {
      enum: colors.map((c) => c.id),
      enumName: 'ColorId',
      examples: [colors[0].id],
      description: 'A name of a Minecraft color',
    },
    type: () => String,
  })
  public id: ColorId;

  public constructor(code: ColorCode | ColorHex | ColorId) {
    const color = colors.find((c) => c.code === code || c.hex === code || c.id === code)!;

    this.code = color?.code;
    this.hex = color?.hex;
    this.id = color?.id;
  }

  public toString() {
    return this.code;
  }
}
