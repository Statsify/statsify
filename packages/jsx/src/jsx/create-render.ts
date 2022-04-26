import type { Canvas, CanvasRenderingContext2D } from 'canvas';
import type { BaseThemeContext, Instruction } from './types';
import { getPositionalDelta, getTotalSize } from './util';

const render = <T extends BaseThemeContext>(
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
      render(ctx, theme, child, x, y);
      oppSide === 'x' ? (x -= centerDelta) : (y -= centerDelta);
    } else {
      render(ctx, theme, child, x, y);
    }

    applyDelta(size);
  });
};

export function createRender<T extends BaseThemeContext = BaseThemeContext>(
  canvas: Canvas,
  instructions: Instruction,
  theme: T
): Canvas {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  render(ctx, theme, instructions, 0, 0);

  return canvas;
}
