import { Canvas, type CanvasRenderingContext2D } from 'skia-canvas';
import Container from 'typedi';
import { FontRenderer } from '../font';
import { createInstructions } from './create-instructions';
import type { IntrinsicRenders } from './instrinsics';
import type { BaseThemeContext, ElementNode, Instruction } from './types';
import { getPositionalDelta, getTotalSize } from './util';

const _render = <T extends BaseThemeContext>(
  ctx: CanvasRenderingContext2D,
  theme: T,
  instruction: Instruction,
  x: number,
  y: number
) => {
  x += instruction.x.margin1;
  y += instruction.y.margin1;

  const location = {
    x,
    y,
    width: instruction.x.size,
    height: instruction.y.size,
    padding: {
      left: instruction.x.padding1,
      right: instruction.x.padding2,
      top: instruction.y.padding1,
      bottom: instruction.y.padding2,
    },
    margin: {
      left: instruction.x.margin1,
      right: instruction.x.margin2,
      top: instruction.y.margin1,
      bottom: instruction.y.margin2,
    },
  };

  instruction.render(ctx, instruction.props, location, theme);

  if (!instruction.children?.length) return;

  x += instruction.x.padding1;
  y += instruction.y.padding1;

  const applyDelta = (delta: number) => {
    switch (instruction.style.direction) {
      case 'row':
        x += delta;
        break;
      case 'column':
        y += delta;
        break;
    }
  };

  const side = instruction.style.direction === 'row' ? 'x' : 'y';

  applyDelta(getPositionalDelta(instruction, side));

  instruction.children.forEach((child) => {
    const size = getTotalSize(child[side]);

    if (child.style.align === 'center') {
      const oppSide = side === 'x' ? 'y' : 'x';
      const oppSize = getTotalSize(child[oppSide]);

      const centerDelta = (instruction[oppSide].size - oppSize) / 2;

      oppSide === 'x' ? (x += centerDelta) : (y += centerDelta);
      _render(ctx, theme, child, x, y);
      oppSide === 'x' ? (x -= centerDelta) : (y -= centerDelta);
    } else {
      _render(ctx, theme, child, x, y);
    }

    applyDelta(size);
  });
};

export function render<T extends BaseThemeContext = BaseThemeContext>(
  node: ElementNode,
  width: number,
  height: number,
  theme?: T,
  intrinsicElements?: Partial<IntrinsicRenders<T>>
): Canvas {
  const instructions = createInstructions(node, width, height, intrinsicElements);

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  _render(ctx, theme ?? { renderer: Container.get(FontRenderer) }, instructions, 0, 0);

  return canvas;
}
