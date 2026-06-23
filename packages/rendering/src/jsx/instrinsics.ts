/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Arc, Box, Div, Donut, Gradient, Graph, Heatmap, Image, Path, Radar, SparkBar, Text } from "#intrinsics";
import type { PropsWithChildren, RawFC, Render } from "./types.js";

export const intrinsicElements = {
  arc: Arc.component,
  box: Box.component,
  div: Div.component,
  donut: Donut.component,
  gradient: Gradient.component,
  graph: Graph.component,
  heatmap: Heatmap.component,
  img: Image.component,
  path: Path.component,
  radar: Radar.component,
  sparkbar: SparkBar.component,
  text: Text.component,
};

export type IntrinsicElements = typeof intrinsicElements;

export type IntrinsicProps = {
  [key in IntrinsicElement]: IntrinsicElements[key] extends RawFC<infer P, any, infer C> ?
    PropsWithChildren<P, C> :
    never;
};

export type IntrinsicElement = keyof IntrinsicElements;

export type IntrinsicRenders = {
  [key in IntrinsicElement]: Render<
    IntrinsicElements[key] extends RawFC<any, infer U, any> ? U : never
  >;
};

export const intrinsicRenders: IntrinsicRenders = {
  arc: Arc.render,
  box: Box.render,
  div: Div.render,
  donut: Donut.render,
  gradient: Gradient.render,
  graph: Graph.render,
  heatmap: Heatmap.render,
  img: Image.render,
  path: Path.render,
  radar: Radar.render,
  sparkbar: SparkBar.render,
  text: Text.render,
};
