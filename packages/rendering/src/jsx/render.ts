/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container from "typedi";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import { FontRenderer } from "../font";
import { IntrinsicRenders, intrinsicRenders } from "./instrinsics";
import { createInstructions } from "./create-instructions";
import { getPositionalDelta, getTotalSize } from "./util";
import type { BaseThemeContext, ElementNode, Instruction, Theme } from "./types";

const _render = <T extends BaseThemeContext>(
  ctx: CanvasRenderingContext2D,
  theme: T,
  intrinsicElements: IntrinsicRenders<T>,
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

  intrinsicElements[instruction.type](ctx, instruction.props, location, theme);

  if (!instruction.children?.length) return;

  x += instruction.x.padding1;
  y += instruction.y.padding1;

  const applyDelta = (delta: number) => {
    switch (instruction.style.direction) {
      case "row":
        x += delta;
        break;
      case "column":
        y += delta;
        break;
    }
  };

  const side = instruction.style.direction === "row" ? "x" : "y";

  applyDelta(getPositionalDelta(instruction, side));

  instruction.children.forEach((child) => {
    const size = getTotalSize(child[side]);

    if (child.style.align === "center") {
      const oppSide = side === "x" ? "y" : "x";
      const oppSize = getTotalSize(child[oppSide]);

      const centerDelta = (instruction[oppSide].size - oppSize) / 2;

      oppSide === "x" ? (x += centerDelta) : (y += centerDelta);
      _render(ctx, theme, intrinsicElements, child, x, y);
      oppSide === "x" ? (x -= centerDelta) : (y -= centerDelta);
    } else if (child.style.align === "left") {
      _render(ctx, theme, intrinsicElements, child, x, y);
    } else {
      throw new Error("Right align is unimplemented");
    }

    applyDelta(size);
  });
};

export function render<T extends BaseThemeContext = BaseThemeContext>(
  node: ElementNode,
  theme?: Theme<T>
): Canvas {
  const instructions = createInstructions(node);

  const width = Math.round(getTotalSize(instructions.x));
  const height = Math.round(getTotalSize(instructions.y));

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  _render(
    ctx,
    theme?.context ?? ({ renderer: Container.get(FontRenderer) } as T),
    { ...intrinsicRenders, ...theme?.elements },
    instructions,
    0,
    0
  );

  return canvas;
}
