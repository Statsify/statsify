/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable @typescript-eslint/ban-types */
import type {
  CanvasGradient,
  CanvasPattern,
  CanvasRenderingContext2D,
  CanvasTexture,
} from "skia-canvas";
import type { FontRenderer } from "#font";
import type { IntrinsicElement, IntrinsicRenders } from "./instrinsics.js";
import type { WinterThemeService } from "../winter-theme.service.js";

export interface BaseThemeContext {
  renderer: FontRenderer;
  winterTheme: WinterThemeService
}

export interface ComputedThemeContext extends BaseThemeContext {
  canvasWidth: number;
  canvasHeight: number;
}

export interface Theme {
  context: BaseThemeContext;
  elements: Partial<IntrinsicRenders>;
}

export type Fill = string | CanvasGradient | CanvasPattern | CanvasTexture;

export type StyleLocation = "left" | "center" | "right";
export type StyleDirection = "row" | "column";

export interface Style {
  location: StyleLocation;
  direction: StyleDirection;
  align: StyleLocation;
}

export interface CompleteSpacing {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export type Spacing = number | Partial<CompleteSpacing>;

export type Percent = `${number}%`;
export type Fraction = `${number}/${number}`;
export type Measurement = number | Percent | Fraction | "remaining";

export interface ElementDimension {
  padding?: Spacing;
  margin?: Spacing;
  width?: Measurement;
  height?: Measurement;
}

export interface Location {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: CompleteSpacing;
  margin: CompleteSpacing;
}

export type Render<T = unknown> = (
  ctx: CanvasRenderingContext2D,
  props: T,
  location: Location,
  theme: ComputedThemeContext,
  component?: string
) => void;

export interface ElementNodeBiDirectional {
  size?: Measurement;
  minSize: number;
  padding1: number;
  padding2: number;
  margin1: number;
  margin2: number;
  direction: StyleDirection;
}

export interface ElementNode {
  component?: string;
  style: Style;
  children?: ElementNode[];
  props: any;
  type: IntrinsicElement;
  x: ElementNodeBiDirectional;
  y: ElementNodeBiDirectional;
}

export interface RawElement<T = unknown> {
  style: Style;
  children?: ElementNode[] | ElementNode;
  props: T;
  dimension: ElementDimension;
}

export interface InstructionBiDirectional extends ElementNodeBiDirectional {
  size: number;
}

export interface Instruction extends ElementNode {
  x: InstructionBiDirectional;
  y: InstructionBiDirectional;
  children?: Instruction[];
}

export type Children<T = ElementNode> = T extends ElementNode ? T | T[] : T;

export type PropsWithChildren<T, K = Children | undefined> = T &
  (K extends undefined ? { children?: K } : { children: K });

export type FC<T = {}> = (
  props: T extends { children: any } ? T : PropsWithChildren<T>
) => ElementNode | null;

/**
 * T is the type of the element's props
 * K is the type of the element's render function props
 * C is the type of the element's children
 */
export type RawFC<T = {}, K = T, C = Children | undefined> = (
  props: PropsWithChildren<T, C>
) => RawElement<K>;
