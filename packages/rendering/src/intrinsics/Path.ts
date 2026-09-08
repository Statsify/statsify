/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export type PathDrawFn = (ctx: CanvasRenderingContext2D, location: JSX.Location) => void;

export interface PathRenderProps {
  draw: PathDrawFn;
}

export interface PathProps {
  draw: PathDrawFn;
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<PathProps, PathRenderProps, undefined> = ({
  draw,
  width = "100%",
  height = "100%",
  margin = 0,
  location = "left",
  align = "left",
}) => ({
  dimension: { width, height, margin },
  style: { location, direction: "row", align },
  props: { draw },
  children: undefined,
});

export const render: JSX.Render<PathRenderProps> = (
  ctx: CanvasRenderingContext2D,
  { draw },
  location
) => {
  ctx.save();
  draw(ctx, location);
  ctx.restore();
};
