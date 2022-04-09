import { getMinecraftTexturePath } from '@statsify/assets';
import { Canvas, loadImage } from 'canvas';
import { readdir } from 'fs/promises';
import { join } from 'path';
import positions from '../../positions.json';
import sizes from '../../sizes.json';
import { mcShadow } from '../colors';
import { TextNode, Token, tokens } from './tokens';

type CharacterSizes = Record<string, { start?: number; width?: number }>;

interface Sizes {
  ascii: CharacterSizes;
  unicode: CharacterSizes;
}

export class FontRenderer {
  private images: Map<string, Canvas> = new Map();
  private sizes: Sizes = sizes;
  private positions: string[][] = positions;

  public async loadImages() {
    const fontDir = getMinecraftTexturePath('textures/font');
    const files = await readdir(fontDir);

    const pictures = files.filter((file) => file.endsWith('.png'));

    for (const file of pictures) {
      const image = await loadImage(join(fontDir, file));

      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(image, 0, 0);

      this.images.set(file.replace('unicode_page_', '').replace('.png', ''), canvas);
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

      let largestSize = row[0].size;

      for (const { text, color, bold, italic, underline, size, shadow } of row) {
        if (size > largestSize) largestSize = size;

        for (const char of text) {
          x += this.fillCharacter(ctx, char, x, y, size, bold, italic, underline, color, shadow);
        }
      }

      y += largestSize * 10;
    }
  }

  public lex(text: string): TextNode[][] {
    console.log(text);

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
    return unicode.toUpperCase() in this.sizes.ascii;
  }

  private getCharacterImage(unicode: string, isAscii: boolean) {
    return isAscii ? this.images.get('ascii') : this.images.get(`${unicode[0]}${unicode[1]}`);
  }

  private getTextureScale(image: Canvas) {
    return image.width / 256;
  }

  private getCharacterIndexLocation(unicode: string, isAscii: boolean) {
    if (isAscii) {
      const y = this.positions.findIndex((row) => row.includes(unicode));
      const x = this.positions[y].indexOf(unicode);

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

    const characterSize = this.sizes[isAscii ? 'ascii' : `unicode`][unicode.toUpperCase()];

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

    const drawPlainCharacter = (x: number, y: number, color: [number, number, number]) => {
      const imageContext = image.getContext('2d');

      let canvasX = 0;
      let canvasY = 0;

      for (let imgX = 0; imgX < width; imgX++) {
        for (let imgY = 0; imgY < height; imgY++) {
          const imageData = imageContext.getImageData(charX + imgX, charY + imgY, 1, 1);

          if (imageData.data[3] > 0) {
            imageData.data[0] = color[0];
            imageData.data[1] = color[1];
            imageData.data[2] = color[2];
            imageData.data[3] = 255;

            let offset = 0;

            if (italic) {
              if (imgY < 2 * scale) offset = 2;
              else if (imgY < 6 * scale) offset = 1;
              else if (imgY < 10 * scale) offset = 0;
              else if (imgY < 14 * scale) offset = -1;
              else if (imgY < 16 * scale) offset = -2;

              offset *= scale * size;
            }

            const baseX = x + offset + canvasX;
            const baseY = y + canvasY;

            for (let sX = 0; sX < size; sX++) {
              for (let sY = 0; sY < size; sY++) {
                ctx.putImageData(imageData, baseX + sX, baseY + sY);
              }
            }
          }

          canvasY += size;
        }

        canvasY = 0;
        canvasX += size;
      }
    };

    const drawUnderline = (x: number, y: number, color: [number, number, number]) => {
      ctx.fillStyle = `rgba(${color.join(', ')}, 1)`;

      ctx.fillRect(
        x - 2 * scale * size,
        y + 16 * scale * size,
        (width + 4) * scale * size,
        size * scale * 2
      );
    };

    const drawCharacter = (x: number, y: number, color: [number, number, number]) => {
      drawPlainCharacter(x, y, color);

      if (underline) drawUnderline(x, y, color);

      if (bold) {
        drawPlainCharacter(x + scale * size, y, color);
        if (isAscii) drawPlainCharacter(x + 2 * scale * size, y, color);
        if (underline) drawUnderline(x + 2 * scale * size, y, color);
      }
    };

    if (shadow) {
      const shadowColor = mcShadow(color);
      const offset = isAscii ? 2 : 1;
      drawCharacter(x + offset * scale * size, y + offset * scale * size, shadowColor);
    }

    drawCharacter(x, y, color);

    return this.getCharacterSpacing(char, isAscii, size, scale, width, bold);
  }
}
