/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PackStack, assetPath, namespaceIds, namespaced } from "./pack.js";
import { context, createCanvas, decodePng, hex } from "./canvas.js";
import { unzipSync } from "fflate";

interface TextStyle {
  /** 0xRRGGBB */
  color: number;
  bold: boolean;
  italic: boolean;
  underlined: boolean;
  strikethrough: boolean;
  obfuscated: boolean;
}

interface TextRun {
  text: string;
  style: TextStyle;
}

/** Text as § codes or a JSON text component, as newer items and chat carry it */
export type TextComponent =
  | string
  | TextComponent[]
  | {
      text?: string;
      color?: string;
      bold?: boolean;
      italic?: boolean;
      underlined?: boolean;
      strikethrough?: boolean;
      obfuscated?: boolean;
      extra?: TextComponent[];
    };

// The chat colors by name, in § code order
const COLORS: Record<string, number> = {
  black: 0x00_00_00,
  dark_blue: 0x00_00_aa,
  dark_green: 0x00_aa_00,
  dark_aqua: 0x00_aa_aa,
  dark_red: 0xaa_00_00,
  dark_purple: 0xaa_00_aa,
  gold: 0xff_aa_00,
  gray: 0xaa_aa_aa,
  dark_gray: 0x55_55_55,
  blue: 0x55_55_ff,
  green: 0x55_ff_55,
  aqua: 0x55_ff_ff,
  red: 0xff_55_55,
  light_purple: 0xff_55_ff,
  yellow: 0xff_ff_55,
  white: 0xff_ff_ff,
};

const CODE_COLORS = Object.values(COLORS);

const FORMATS: Record<string, keyof Omit<TextStyle, "color">> = {
  k: "obfuscated",
  l: "bold",
  m: "strikethrough",
  n: "underlined",
  o: "italic",
};

const plainStyle = (color = 0xff_ff_ff): TextStyle => ({
  color,
  bold: false,
  italic: false,
  underlined: false,
  strikethrough: false,
  obfuscated: false,
});

/**
 * Splits §-coded text into styled runs. A color code clears bold, italic and the rest, and
 * §r goes back to the color the text started in, as in game.
 */
function parseLegacy(text: string, base: TextStyle): TextRun[] {
  const runs: TextRun[] = [];
  let style = base;
  let current = "";

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "§") {
      current += text[i];
      continue;
    }

    if (current) runs.push({ text: current, style });
    current = "";

    const code = text[++i]?.toLowerCase() ?? "";
    const color = "0123456789abcdef".indexOf(code);

    if (code && color !== -1) style = plainStyle(CODE_COLORS[color]);
    else if (code === "r") style = plainStyle(base.color);
    else if (FORMATS[code]) style = { ...style, [FORMATS[code]]: true };
  }

  if (current) runs.push({ text: current, style });
  return runs;
}

function componentColor(color: string | undefined, fallback: number) {
  if (!color) return fallback;
  if (color.startsWith("#")) return Number.parseInt(color.slice(1), 16);
  return COLORS[color] ?? fallback;
}

/** Flattens a JSON text component into runs, children inheriting their parent's style */
function parseComponent(component: TextComponent, inherited: TextStyle = plainStyle()): TextRun[] {
  if (typeof component === "string") return parseLegacy(component, inherited);
  if (Array.isArray(component)) return component.flatMap((child) => parseComponent(child, inherited));

  const style: TextStyle = {
    color: componentColor(component.color, inherited.color),
    bold: component.bold ?? inherited.bold,
    italic: component.italic ?? inherited.italic,
    underlined: component.underlined ?? inherited.underlined,
    strikethrough: component.strikethrough ?? inherited.strikethrough,
    obfuscated: component.obfuscated ?? inherited.obfuscated,
  };

  return [
    ...parseLegacy(component.text ?? "", style),
    ...(component.extra ?? []).flatMap((child) => parseComponent(child, style)),
  ];
}

interface Glyph {
  /** The font sheet or unifont glyph it's drawn from, and where on it. Spaces have none */
  image?: OffscreenCanvas;
  x: number;
  y: number;
  width: number;
  height: number;
  /** In GUI pixels */
  scale: number;
  top: number;
  advance: number;
  /** How far the shadow and bold's second copy sit from the glyph: 1, or ½ for unifont */
  offset: number;
}

// The font providers drawn here. Others, like ttf, match none of these types and are skipped
type Provider = { filter?: Record<string, boolean> } & (
  | { type: "minecraft:reference"; id: string }
  | { type: "minecraft:space"; advances: Record<string, number> }
  | { type: "minecraft:bitmap"; file: string; ascent: number; height?: number; chars: string[] }
  | {
      type: "minecraft:unihex";
      hex_file: string;
      size_overrides?: { from: string; to: string; left: number; right: number }[];
    }
);

/** A unihex font: GNU Unifont's 16-pixel-tall glyphs as hex rows, by code point */
interface Unihex {
  rows: Map<number, string>;
  overrides: { from: number; to: number; left: number; right: number }[];
}

// The font options a provider's filter can ask for, as the game sets them by default
const FONT_OPTIONS: Record<string, boolean> = { uniform: false, jp: false };

// The CSS font family for characters the pack's fonts don't have
const FALLBACK_FONT = "Minecraft";

const fallbackFont = (scale: number) => `${8 * scale}px "${FALLBACK_FONT}"`;

const decoder = new TextDecoder();

function readUnihex(zip: Uint8Array) {
  const rows = new Map<number, string>();
  const files = unzipSync(zip, { filter: ({ name }) => name.endsWith(".hex") });

  for (const file of Object.values(files)) {
    for (const line of decoder.decode(file).split("\n")) {
      const colon = line.indexOf(":");
      if (colon > 0) rows.set(Number.parseInt(line.slice(0, colon), 16), line.slice(colon + 1).trim());
    }
  }

  return rows;
}

// Draws a unifont glyph from its 16 hex rows, each a quarter as many digits as the glyph is wide
function unihexGlyph(glyphHex: string, override?: { left: number; right: number }): Glyph {
  const columns = glyphHex.length / 4;
  const digits = columns / 4;
  const bits = Array.from({ length: 16 }, (_, row) => Number.parseInt(glyphHex.slice(row * digits, (row + 1) * digits), 16));
  const lit = (line: number, column: number) => ((line >>> (columns - 1 - column)) & 1) === 1;

  // A glyph spans its lit columns, unless the font fixes the width for its range
  const any = bits.reduce((all, row) => all | row, 0);
  let left = columns;
  let right = -1;

  for (let column = 0; column < columns; column++) {
    if (lit(any, column)) {
      left = Math.min(left, column);
      right = column;
    }
  }

  if (override) ({ left, right } = override);
  if (right < left) left = right + 1;

  const width = right - left + 1;
  const canvas = createCanvas(Math.max(1, width), 16);
  const ctx = context(canvas);
  const pixels = ctx.createImageData(canvas.width, 16);

  for (let row = 0; row < 16; row++) {
    for (let column = 0; column < width; column++) {
      const i = (row * canvas.width + column) * 4;
      if (lit(bits[row], left + column)) pixels.data.fill(255, i, i + 4);
    }
  }

  ctx.putImageData(pixels, 0, 0);

  // Unifont draws at half size, 8 GUI pixels tall, so its shadow and bold move half a pixel
  return {
    image: canvas,
    x: 0,
    y: 0,
    width,
    height: 16,
    scale: 0.5,
    top: 0,
    advance: Math.floor(width / 2) + 1,
    offset: 0.5,
  };
}

// The width a bitmap glyph takes: up to its rightmost column with any pixel in it
function glyphWidth(pixels: ImageData, x: number, y: number, width: number, height: number) {
  for (let column = width - 1; column >= 0; column--) {
    for (let row = 0; row < height; row++) {
      if (pixels.data[((y + row) * pixels.width + x + column) * 4 + 3] > 0) return column + 1;
    }
  }

  return 0;
}

export interface DrawTextOptions {
  /** Screen pixels per GUI pixel */
  scale: number;
  shadow?: boolean;
  /** The color text starts in and §r goes back to, white unless set */
  color?: number;
  /** Picks the characters §k shows */
  tick?: number;
}

/** Draws Minecraft text from a pack's default font, with a CSS font for characters it lacks */
export class TextRenderer {
  private tinted = new Map<OffscreenCanvas, Map<number, OffscreenCanvas>>();
  private obfuscated = new Map<number, string[]>();
  private measure = context(createCanvas(1, 1));

  private constructor(
    private glyphs: Map<string, Glyph>,
    private unihex: Unihex[],
  ) {}

  public static async load(stack: PackStack) {
    const glyphs = new Map<string, Glyph>();
    const providers: Provider[] = [];

    const collect = (id: string) => {
      const font = stack.json<{ providers: Provider[] }>(assetPath(id, "font", ".json"), namespaceIds);

      for (const provider of font?.providers ?? []) {
        const wanted = Object.entries(provider.filter ?? {}).every(([option, value]) => FONT_OPTIONS[option] === value);
        if (!wanted) continue;

        if (provider.type === "minecraft:reference") collect(provider.id);
        else providers.push(provider);
      }
    };

    collect("minecraft:default");

    const sheets = await Promise.all(
      providers.map(async (provider) => {
        if (provider.type !== "minecraft:bitmap") return undefined;
        const file = stack.get(assetPath(provider.file, "textures", ""));
        return file ? context(await decodePng(file)) : undefined;
      }),
    );

    // Earlier providers win, so a character keeps the first glyph found for it
    for (const [index, provider] of providers.entries()) {
      if (provider.type === "minecraft:space") {
        for (const [char, advance] of Object.entries(provider.advances)) {
          if (!glyphs.has(char)) {
            glyphs.set(char, { x: 0, y: 0, width: 0, height: 0, scale: 1, top: 0, advance, offset: 1 });
          }
        }
      }

      const sheet = sheets[index];
      if (provider.type !== "minecraft:bitmap" || !sheet) continue;

      const { chars, ascent, height = 8 } = provider;
      const rows = chars.map((row) => [...row]);
      const cellWidth = sheet.canvas.width / rows[0].length;
      const cellHeight = sheet.canvas.height / rows.length;
      const scale = height / cellHeight;
      const pixels = sheet.getImageData(0, 0, sheet.canvas.width, sheet.canvas.height);

      for (const [row, line] of rows.entries()) {
        for (const [column, char] of line.entries()) {
          if (char === "\0" || glyphs.has(char)) continue;

          const x = column * cellWidth;
          const y = row * cellHeight;
          const width = glyphWidth(pixels, x, y, cellWidth, cellHeight);

          glyphs.set(char, {
            image: sheet.canvas,
            x,
            y,
            width,
            height: cellHeight,
            scale,
            top: 7 - ascent,
            advance: Math.floor(0.5 + width * scale) + 1,
            offset: 1,
          });
        }
      }
    }

    const unihex = providers.flatMap((provider): Unihex[] => {
      if (provider.type !== "minecraft:unihex") return [];

      const { hex_file: file, size_overrides: overrides = [] } = provider;
      const [namespace, path] = namespaced(file).split(":");
      const zip = stack.get(`assets/${namespace}/${path}`);
      if (!zip) return [];

      return [
        {
          rows: readUnihex(zip),
          overrides: overrides.map(({ from, to, left, right }) => ({
            from: from.codePointAt(0)!,
            to: to.codePointAt(0)!,
            left,
            right,
          })),
        },
      ];
    });

    return new TextRenderer(glyphs, unihex);
  }

  /** A character's glyph, drawing unifont ones the first time they're needed */
  private lookup(char: string): Glyph | undefined {
    let glyph = this.glyphs.get(char);
    if (glyph) return glyph;

    const codepoint = char.codePointAt(0)!;
    const font = this.unihex.find(({ rows }) => rows.has(codepoint));
    if (!font) return undefined;

    const override = font.overrides.find(({ from, to }) => codepoint >= from && codepoint <= to);
    glyph = unihexGlyph(font.rows.get(codepoint)!, override);
    this.glyphs.set(char, glyph);
    return glyph;
  }

  /** A line's width in GUI pixels */
  public width(text: TextComponent) {
    let width = 0;

    for (const { text: part, style } of parseComponent(text)) {
      for (const char of part) width += this.advance(char, style.bold);
    }

    return width;
  }

  /** Draws a line with its top left at x, y in screen pixels */
  public draw(
    ctx: OffscreenCanvasRenderingContext2D,
    text: TextComponent,
    x: number,
    y: number,
    options: DrawTextOptions,
  ) {
    const runs = parseComponent(text, plainStyle(options.color));

    // Vanilla draws the shadow first, down and right of the text at a quarter of its color
    if (options.shadow ?? true) this.line(ctx, runs, x, y, options, true);
    this.line(ctx, runs, x, y, options, false);
  }

  /** How far a character moves the cursor, in GUI pixels; bold adds its glyph's offset */
  private advance(char: string, bold = false, glyph = this.lookup(char)) {
    if (glyph) return glyph.advance + (bold ? glyph.offset : 0);

    this.measure.font = fallbackFont(1);
    return Math.ceil(this.measure.measureText(char).width) + 1 + (bold ? 1 : 0);
  }

  private line(
    ctx: OffscreenCanvasRenderingContext2D,
    runs: TextRun[],
    x: number,
    y: number,
    { scale, tick = 0 }: DrawTextOptions,
    shadow: boolean,
  ) {
    let cursor = x;
    let seed = tick * 7919 + 1;

    for (const { text, style } of runs) {
      const color = shadow ? ((style.color & 0xfc_fc_fc) >> 2) : style.color;

      for (let char of text) {
        if (style.obfuscated && char !== " ") {
          const same = this.sameWidth(this.advance(char));
          seed = (seed * 16_807) % 2_147_483_647;
          if (same.length > 0) char = same[seed % same.length];
        }

        const glyph = this.lookup(char);
        const offset = (glyph?.offset ?? 1) * scale;
        const shift = shadow ? offset : 0;

        this.drawGlyph(ctx, glyph, char, cursor + shift, y + shift, color, style.italic, scale);
        if (style.bold) {
          this.drawGlyph(ctx, glyph, char, cursor + shift + offset, y + shift, color, style.italic, scale);
        }

        // Lines move a whole pixel for the shadow, whatever the glyph
        const width = this.advance(char, style.bold, glyph) * scale;
        const line = shadow ? scale : 0;
        ctx.fillStyle = hex(color);
        if (style.strikethrough) ctx.fillRect(cursor + line, y + 3.5 * scale + line, width, scale);
        if (style.underlined) ctx.fillRect(cursor - scale + line, y + 8 * scale + line, width + scale, scale);

        cursor += width;
      }
    }
  }

  /** Draws a glyph, or the character in the fallback font when the pack has no glyph for it */
  private drawGlyph(
    ctx: OffscreenCanvasRenderingContext2D,
    glyph: Glyph | undefined,
    char: string,
    x: number,
    y: number,
    color: number,
    italic: boolean,
    scale: number,
  ) {
    if (!glyph) {
      ctx.font = fallbackFont(scale);
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = hex(color);
      ctx.fillText(char, x, y + 7 * scale);
      return;
    }

    if (!glyph.image || glyph.width === 0) return;

    const sheet = this.tint(glyph.image, color);
    const size = glyph.scale * scale;
    const top = y + glyph.top * scale;

    if (!italic) {
      ctx.drawImage(sheet, glyph.x, glyph.y, glyph.width, glyph.height, x, top, glyph.width * size, glyph.height * size);
      return;
    }

    // Italics lean each row right by a quarter pixel per pixel above the bottom, as vanilla does
    for (let row = 0; row < glyph.height; row++) {
      const shift = (1 - 0.25 * (glyph.top + (row + 0.5) * glyph.scale)) * scale;
      ctx.drawImage(
        sheet,
        glyph.x,
        glyph.y + row,
        glyph.width,
        1,
        Math.round(x + shift),
        top + row * size,
        glyph.width * size,
        size,
      );
    }
  }

  private tint(source: OffscreenCanvas, color: number) {
    let tints = this.tinted.get(source);
    if (!tints) this.tinted.set(source, (tints = new Map()));

    let tinted = tints.get(color);

    if (!tinted) {
      tinted = createCanvas(source.width, source.height);

      const ctx = context(tinted);
      ctx.drawImage(source, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = hex(color);
      ctx.fillRect(0, 0, source.width, source.height);

      tints.set(color, tinted);
    }

    return tinted;
  }

  /** Characters with this advance, for §k to swap in */
  private sameWidth(advance: number) {
    let chars = this.obfuscated.get(advance);

    if (!chars) {
      chars = [...this.glyphs].filter(([, glyph]) => glyph.image && glyph.advance === advance).map(([char]) => char);
      this.obfuscated.set(advance, chars);
    }

    return chars;
  }
}

