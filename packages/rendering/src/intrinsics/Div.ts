/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { noop } from "@statsify/util";
import type * as JSX from "#jsx";

export interface DivProps {
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
  align?: JSX.StyleLocation;
}

export type DivRenderProps = unknown;

export const component: JSX.RawFC<DivProps, DivRenderProps> = ({
  children,
  width,
  height,
  align = "left",
  direction = "row",
  location = "center",
  margin,
  padding,
}) => ({
  name: "Div",
  render: noop,
  dimension: {
    margin,
    padding,
    width,
    height,
  },
  props: {},
  style: { location, direction, align },
  children,
});

export const render: JSX.Render<DivRenderProps> = noop;
