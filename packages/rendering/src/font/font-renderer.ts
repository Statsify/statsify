/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import _positions from "../../positions.json" assert { type: "json" };
import _sizes from "../../sizes.json" assert { type: "json" };
import { Canvas, type CanvasRenderingContext2D, type ImageData } from "skia-canvas";
import { type TextNode, type Token, tokens } from "./tokens.js";
import { join } from "node:path";
import { loadImage } from "#hooks";
import { readdir } from "node:fs/promises";
import type { Fill } from "#jsx";

const sizes: Sizes = _sizes;
const positions: string[][] = _positions;

type CharacterSizes = Record<string, { start?: number; width?: number }>;

interface Sizes {
  ascii: CharacterSizes;
  unicode: CharacterSizes;
}

export class FontRenderer {
  private images: Map<string, CanvasRenderingContext2D> = new Map();

  public async loadImages(fontPath: string) {
    const files = await readdir(fontPath);

    const pictures = files.filter((file) => file.endsWith(".png"));

    for (const file of pictures) {
      const image = await loadImage(join(fontPath, file));

      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(image, 0, 0);

      this.images.set(file.replace("unicode_page_", "").replace(".png", ""), ctx);
    }
  }

  public measureText(nodes: TextNode[]): { width: number; height: number } {
    let width = 0;
    let largestSize = nodes[0].size;

    for (const { text, bold, size } of nodes) {
      if (size > largestSize) largestSize = size;

      for (const char of text) {
        width += this.measureCharacter(char, size, bold);
      }
    }

    const height = largestSize * 10;

    return { width, height };
  }

  public fillText(
    ctx: CanvasRenderingContext2D,
    nodes: TextNode[],
    x: number,
    y: number
  ) {
    const largestSize = Math.max(...nodes.map((node) => node.size));

    for (const { text, color, bold, italic, underline, strikethrough, size } of nodes) {
      const adjustY = y + size + (largestSize - size) * 5;

      for (const char of text) {
        x += this.fillCharacter(
          ctx,
          char,
          Math.round(x),
          Math.round(adjustY),
          size,
          bold,
          italic,
          underline,
          strikethrough,
          color
        );
      }
    }
  }

  public lex(text: string, inputState: Partial<TextNode> = {}): TextNode[] {
    const defaultState: Omit<TextNode, "text"> = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: "#FFFFFF",
      size: 2,
      ...inputState,
    };

    if (!text) return [{ ...defaultState, text: "" }];

    let state = defaultState;
    const parts = (text.startsWith("§") ? text : `§f${text}`).split("§");

    const nodes: TextNode[] = [];

    for (const part of parts) {
      if (!part.length) continue;

      let token: Token | null = null;
      let matches: RegExpMatchArray | null = null;

      for (const matcher of tokens) {
        matches = part.match(matcher.regex);

        if (matches) {
          token = matcher;
          break;
        }
      }

      if (!matches) continue;

      const effect = token?.effect(part, matches as RegExpMatchArray, defaultState);
      let text = effect?.text ?? part;

      if (matches) text = text.slice(matches[0].length);

      state = { ...state, ...effect };

      if (!text.length) continue;

      const node: TextNode = {
        ...state,
        text,
      };

      nodes.push(node);
    }

    return nodes;
  }

  private getUnicode(char: string) {
    const hex = (char.codePointAt(0) ?? 0).toString(16);
    return `${"0000".slice(0, Math.max(0, 4 - hex.length))}${hex}`;
  }

  private isAscii(unicode: string) {
    return unicode.toUpperCase() in sizes.ascii;
  }

  private getCharacterImage(unicode: string, isAscii: boolean) {
    return isAscii
      ? this.images.get("ascii")
      : this.images.get(`${unicode[0]}${unicode[1]}`);
  }

  private getTextureScale(image: CanvasRenderingContext2D) {
    return image.canvas.width / 256;
  }

  private getCharacterIndexLocation(unicode: string, isAscii: boolean) {
    if (isAscii) {
      const y = positions.findIndex((row) => row.includes(unicode));
      const x = positions[y].indexOf(unicode);

      return {
        x,
        y,
      };
    }

    return {
      x: Number.parseInt(unicode[3], 16),
      y: Number.parseInt(unicode[2], 16),
    };
  }

  private getCharacterMetadata(char: string, size: number) {
    const unicode = this.getUnicode(char);
    const isAscii = this.isAscii(unicode);
    const image = this.getCharacterImage(unicode, isAscii);

    if (!image) return null;

    const { x, y } = this.getCharacterIndexLocation(unicode, isAscii);

    const scale = this.getTextureScale(image);

    const characterSize = sizes[isAscii ? "ascii" : "unicode"][unicode.toUpperCase()];

    const startOffset = characterSize?.start ?? 0;
    const width = characterSize?.width ?? 0;

    return {
      x: (startOffset + x * 16) * scale,
      y: y * 16 * scale,
      width: width * scale,
      height: 16 * scale,
      scale,
      isAscii,
      image,
      size: scale === 1 ? size / 2 : size,
    };
  }

  private getCharacterSpacing(
    char: string,
    isAscii: boolean,
    size: number,
    scale: number,
    width: number,
    bold: boolean
  ) {
    //Minecraft has weird spacing for the space
    let gap = size * (width + (char == " " ? -2 : 2) * scale);

    if (bold) {
      gap += scale * size;

      if (isAscii) {
        gap += scale * size;
      }
    }

    return gap;
  }

  private measureCharacter(char: string, textSize: number, bold: boolean): number {
    const metadata = this.getCharacterMetadata(char, textSize);

    if (!metadata) return 0;

    return this.getCharacterSpacing(
      char,
      metadata.isAscii,
      metadata.size,
      metadata.scale,
      metadata.width,
      bold
    );
  }

  private fillCharacter(
    ctx: CanvasRenderingContext2D,
    char: string,
    x: number,
    y: number,
    textSize: number,
    bold: boolean,
    italic: boolean,
    underline: boolean,
    strikethrough: boolean,
    color: Fill
  ): number {
    const metadata = this.getCharacterMetadata(char, textSize);

    if (!metadata) return 0;

    const { x: charX, y: charY, width, height, scale, isAscii, image, size } = metadata;

    const imageData = image.getImageData(charX, charY, width, height);
    const resizeFactor = size * scale;

    const offset = isAscii ? 2 : 1;

    ctx.filter = "brightness(25%)";

    this.fillFormattedCharacter(
      ctx,
      imageData,
      x + offset * resizeFactor,
      y + offset * resizeFactor,
      width,
      scale,
      size,
      resizeFactor,
      color,
      underline,
      strikethrough,
      bold,
      italic,
      isAscii
    );

    ctx.filter = "brightness(100%)";

    this.fillFormattedCharacter(
      ctx,
      imageData,
      x,
      y,
      width,
      scale,
      size,
      resizeFactor,
      color,
      underline,
      strikethrough,
      bold,
      italic,
      isAscii
    );

    return this.getCharacterSpacing(char, isAscii, size, scale, width, bold);
  }

  private fillFormattedCharacter(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    x: number,
    y: number,
    width: number,
    scale: number,
    size: number,
    resizeFactor: number,
    color: Fill,
    underline: boolean,
    strikethrough: boolean,
    bold: boolean,
    italic: boolean,
    isAscii: boolean
  ) {
    this.fillPlainCharacter(ctx, imageData, x, y, width, scale, size, color, italic);

    if (underline) this.fillUnderline(ctx, x, y, width, resizeFactor, color);
    if (strikethrough) this.fillStrikethrough(ctx, x, y, width, resizeFactor, color);

    if (bold) {
      this.fillPlainCharacter(
        ctx,
        imageData,
        x + resizeFactor,
        y,
        width,
        scale,
        size,
        color,
        italic
      );

      const offset = x + 2 * resizeFactor;

      if (isAscii)
        this.fillPlainCharacter(
          ctx,
          imageData,
          offset,
          y,
          width,
          scale,
          size,
          color,
          italic
        );
      if (underline) this.fillUnderline(ctx, offset, y, width, resizeFactor, color);
      if (strikethrough)
        this.fillStrikethrough(ctx, offset, y, width, resizeFactor, color);
    }
  }

  private fillPlainCharacter(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    x: number,
    y: number,
    width: number,
    scale: number,
    size: number,
    color: Fill,
    italic: boolean
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) continue;

      const canvasX = (i / 4) % width;
      const canvasY = Math.floor(i / 4 / width);

      let offset = 0;

      if (italic) {
        if (canvasY < 2 * scale) offset = 2;
        else if (canvasY < 6 * scale) offset = 1;
        else if (canvasY < 10 * scale) offset = 0;
        else if (canvasY < 14 * scale) offset = -1;
        else if (canvasY < 16 * scale) offset = -2;

        offset *= scale * size;
      }

      const charX = x + offset + canvasX * size;
      const charY = y + canvasY * size;

      ctx.moveTo(charX, charY);
      ctx.lineTo(charX + size, charY);
      ctx.lineTo(charX + size, charY + size);
      ctx.lineTo(charX, charY + size);
    }

    ctx.closePath();
    ctx.fill();
  }

  private fillLine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    resizeFactor: number,
    color: Fill
  ) {
    ctx.fillStyle = color;

    ctx.fillRect(
      x - 2 * resizeFactor,
      y,
      (width + 2) * (resizeFactor * 2),
      resizeFactor * 2
    );
  }

  private fillUnderline(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    resizeFactor: number,
    color: Fill
  ) {
    return this.fillLine(ctx, x, y + 16 * resizeFactor, width, resizeFactor, color);
  }

  private fillStrikethrough(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    resizeFactor: number,
    color: Fill
  ) {
    return this.fillLine(ctx, x, y + 6 * resizeFactor, width, resizeFactor, color);
  }
}
