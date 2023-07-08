/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { Container } from "typedi";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import { FontRenderer } from "#font";
import { IntrinsicRenders, intrinsicRenders } from "./instrinsics.js";
import { createInstructions } from "./create-instructions.js";
import { getPositionalDelta, getTotalSize } from "./util.js";
import { noop } from "@statsify/util";
import type { ComputedThemeContext, ElementNode, Instruction, Theme } from "./types.js";

const _render = (
  ctx: CanvasRenderingContext2D,
  context: ComputedThemeContext,
  intrinsicElements: IntrinsicRenders,
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

  intrinsicElements[instruction.type](
    ctx,
    instruction.props,
    location,
    context,
    instruction.component
  );

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

    switch (child.style.align) {
      case "center": {
        const oppSide = side === "x" ? "y" : "x";
        const oppSize = getTotalSize(child[oppSide]);

        const centerDelta = (instruction[oppSide].size - oppSize) / 2;

        oppSide === "x" ? (x += centerDelta) : (y += centerDelta);
        _render(ctx, context, intrinsicElements, child, x, y);
        oppSide === "x" ? (x -= centerDelta) : (y -= centerDelta);
        break;
      }
      case "left":
        _render(ctx, context, intrinsicElements, child, x, y);
        break;
      case "right": {
        const oppSide = side === "x" ? "y" : "x";
        const delta =
          instruction[oppSide].size -
          (child[oppSide].size + child[oppSide].margin2 + child[oppSide].padding2);

        oppSide === "x" ? (x += delta) : (y += delta);
        _render(ctx, context, intrinsicElements, child, x, y);
        oppSide === "x" ? (x -= delta) : (y -= delta);

        break;
      }
    }

    applyDelta(size);
  });
};

export function render(node: ElementNode, theme?: Theme): Canvas {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

  const instructionsTransaction = transaction?.startChild({
    op: "jsx.createInstructions",
    description: `Create instructions`,
  });

  const instructions = createInstructions(node);

  instructionsTransaction?.finish();

  const width = Math.round(getTotalSize(instructions.x));
  const height = Math.round(getTotalSize(instructions.y));

  const renderTransaction = transaction?.startChild({
    op: "jsx.render",
    description: `Render JSX`,
  });

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const context: ComputedThemeContext = {
    renderer: noop(),
    ...theme?.context,
    canvasWidth: width,
    canvasHeight: height,
  };

  if (!context.renderer) context.renderer = Container.get(FontRenderer);

  _render(ctx, context, { ...intrinsicRenders, ...theme?.elements }, instructions, 0, 0);

  renderTransaction?.finish();

  return canvas;
}
