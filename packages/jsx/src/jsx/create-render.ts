import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { createInstructions } from './create-instructions';
import type { ElementNode, Instruction } from './types';
import { getPositionalDelta, getTotalSize } from './util';

const render = (ctx: CanvasRenderingContext2D, instruction: Instruction, x: number, y: number) => {
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

  instruction.render(ctx, location);

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
      render(ctx, child, x, y);
      oppSide === 'x' ? (x -= centerDelta) : (y -= centerDelta);
    } else {
      render(ctx, child, x, y);
    }

    applyDelta(size);
  });
};

export function createRender(canvas: Canvas, element: ElementNode): Canvas;
export function createRender(node: ElementNode, width: number, height: number): Canvas;
export function createRender(
  nodeOrCanvas: ElementNode | Canvas,
  widthOrElement: number | ElementNode,
  height?: number
): Canvas {
  let canvas: Canvas;
  let node: ElementNode;

  if (typeof widthOrElement === 'number') {
    canvas = new Canvas(widthOrElement, height as number);
    node = nodeOrCanvas as ElementNode;
  } else {
    canvas = nodeOrCanvas as Canvas;
    node = widthOrElement as ElementNode;
  }

  const instructions = createInstructions(node, canvas.width, canvas.height);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  render(ctx, instructions, 0, 0);

  return canvas;
}
