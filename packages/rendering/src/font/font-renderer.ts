import { readdir } from 'fs/promises';
import { join } from 'path';
import { Canvas, CanvasRenderingContext2D, ImageData, loadImage } from 'skia-canvas';
import _positions from '../../positions.json';
import _sizes from '../../sizes.json';
import { mcShadow, RGB } from '../colors';
import { TextNode, Token, tokens } from './tokens';

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

    const pictures = files.filter((file) => file.endsWith('.png'));

    for (const file of pictures) {
      const image = await loadImage(join(fontPath, file));

      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(image, 0, 0);

      this.images.set(file.replace('unicode_page_', '').replace('.png', ''), ctx);
    }
  }

  public measureText(nodes: TextNode[][]): { width: number; height: number } {
    let width = 0;
    let height = 0;

    for (const row of nodes) {
      let largestSize = row[0].size;
      let rowWidth = 0;

      for (const { text, bold, size } of row) {
        if (size > largestSize) largestSize = size;

        for (const char of text) {
          rowWidth += this.measureCharacter(char, size, bold);
        }
      }

      if (rowWidth > width) width = rowWidth;
      height += largestSize * 10;
    }

    return { width, height };
  }

  public fillText(ctx: CanvasRenderingContext2D, nodes: TextNode[][], x: number, y: number) {
    const tempX = x;

    for (const row of nodes) {
      x = tempX;

      const largestSize = Math.max(...row.map((node) => node.size));

      for (const { text, color, bold, italic, underline, size, shadow } of row) {
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
            color,
            shadow
          );
        }
      }

      y += largestSize * 10;
    }
  }

  public lex(text: string): TextNode[][] {
    const lines = text.split('\n');

    return lines.map((line) => {
      let state: Omit<TextNode, 'text'> = {
        bold: false,
        italic: false,
        underline: false,
        color: [255, 255, 255],
        size: 2,
        shadow: true,
      };

      line = line.startsWith('§') ? line : `§f${line}`;

      return line
        .split('§')
        .filter((line) => line)
        .map((part) => {
          let token: Token | null = null;
          let matches: RegExpMatchArray | null = null;

          for (const matcher of tokens) {
            matches = part.match(matcher.regex);

            if (matches) {
              token = matcher;
              break;
            }
          }

          const effect = token?.effect(part, matches as RegExpMatchArray);
          let text = effect?.text ?? part;

          if (matches) text = text.substring(matches[0].length);

          state = { ...state, ...effect };

          const node: TextNode = {
            ...state,
            text,
          };

          return node;
        });
    });
  }

  private getUnicode(char: string) {
    const hex = (char.codePointAt(0) ?? 0).toString(16);
    return `${'0000'.substring(0, 4 - hex.length)}${hex}`;
  }

  private isAscii(unicode: string) {
    return unicode.toUpperCase() in sizes.ascii;
  }

  private getCharacterImage(unicode: string, isAscii: boolean) {
    return isAscii ? this.images.get('ascii') : this.images.get(`${unicode[0]}${unicode[1]}`);
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
      x: parseInt(unicode[3], 16),
      y: parseInt(unicode[2], 16),
    };
  }

  private getCharacterMetadata(char: string, size: number) {
    const unicode = this.getUnicode(char);
    const isAscii = this.isAscii(unicode);
    const image = this.getCharacterImage(unicode, isAscii);

    if (!image) return null;

    const { x, y } = this.getCharacterIndexLocation(unicode, isAscii);

    const scale = this.getTextureScale(image);

    const characterSize = sizes[isAscii ? 'ascii' : `unicode`][unicode.toUpperCase()];

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
    if (char === ' ') return (4 + (bold ? 1 : 0)) * size;

    let gap = size * (width + 2 * scale);

    if (bold) {
      gap += scale * size;

      if (isAscii) {
        gap += scale * size;
      }
    }

    return gap;
  }

  private measureCharacter(char: string, textSize: number, bold: boolean): number {
    if (char === ' ') return this.getCharacterSpacing(' ', false, textSize, 1, 0, bold);

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
    color: [number, number, number],
    shadow: boolean
  ): number {
    if (char === ' ') return this.getCharacterSpacing(' ', false, textSize, 1, 0, bold);

    const metadata = this.getCharacterMetadata(char, textSize);

    if (!metadata) return 0;

    const { x: charX, y: charY, width, height, scale, isAscii, image, size } = metadata;

    const imageData = image.getImageData(charX, charY, width, height);
    const resizeFactor = size * scale;

    if (shadow) {
      const shadowColor = mcShadow(color);
      const offset = isAscii ? 2 : 1;

      this.fillFormattedCharacter(
        ctx,
        imageData,
        x + offset * resizeFactor,
        y + offset * resizeFactor,
        width,
        scale,
        size,
        resizeFactor,
        shadowColor,
        underline,
        bold,
        italic,
        isAscii
      );
    }

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
    color: RGB,
    underline: boolean,
    bold: boolean,
    italic: boolean,
    isAscii: boolean
  ) {
    this.fillPlainCharacter(ctx, imageData, x, y, width, scale, size, color, italic);

    if (underline) this.fillUnderline(ctx, x, y, width, resizeFactor, color);

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

      if (isAscii)
        this.fillPlainCharacter(
          ctx,
          imageData,
          x + 2 * resizeFactor,
          y,
          width,
          scale,
          size,
          color,
          italic
        );
      if (underline) this.fillUnderline(ctx, x + 2 * resizeFactor, y, width, resizeFactor, color);
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
    [r, g, b]: RGB,
    italic: boolean
  ) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

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

      ctx.fillRect(x + offset + canvasX * size, y + canvasY * size, size, size);
    }
  }

  private fillUnderline(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    resizeFactor: number,
    [r, g, b]: RGB
  ) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    ctx.fillRect(
      x - 2 * resizeFactor,
      y + 16 * resizeFactor,
      (width + 4) * resizeFactor,
      resizeFactor * 2
    );
  }
}
