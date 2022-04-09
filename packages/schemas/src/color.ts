import { minecraftColors as colors } from '@statsify/util';
import { Field } from './decorators';

export type ColorCode = typeof colors[number]['code'];

export type ColorHex = typeof colors[number]['hex'];

/**
 * The name of the color in all caps
 */
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
    const color = colors.find((c) => c.code === code || c.hex === code || c.id === code)!;

    this.code = color?.code;
    this.hex = color?.hex;
    this.id = color?.id;
  }

  public toString() {
    return this.code;
  }
}
