/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, Div, Image, Text } from "#intrinsics";
import type { PropsWithChildren, RawFC, Render } from "./types.js";

export const intrinsicElements = {
  div: Div.component,
  box: Box.component,
  img: Image.component,
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
  div: Div.render,
  box: Box.render,
  img: Image.render,
  text: Text.render,
};
