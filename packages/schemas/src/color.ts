import { Field } from './decorators';

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
export type ColorId = typeof colors[number]['id'];

export class Color {
  @Field({
    enum: colors.map((c) => c.code),
    enumName: 'ColorCode',
    example: colors[0].code,
    type: () => String,
    description: 'A Minecraft color code',
  })
  public code: ColorCode;

  @Field({
    enum: colors.map((c) => c.hex),
    enumName: 'ColorHex',
    example: colors[0].hex,
    type: () => String,
    description: 'A hex color code',
  })
  public hex: ColorHex;

  @Field({
    enum: colors.map((c) => c.id),
    enumName: 'ColorId',
    example: colors[0].id,
    type: () => String,
    description: 'A name of a Minecraft color',
  })
  public id: ColorId;

  public constructor(code: ColorCode | ColorHex | ColorId) {
    const color = colors.find((c) => c.code === code || c.hex === code || c.id === code);

    if (!color) {
      throw new Error(`Invalid color: ${code}`);
    }

    this.code = color.code;
    this.hex = color.hex;
    this.id = color.id;
  }

  public toString() {
    return this.code;
  }
}
