/* eslint-disable @typescript-eslint/ban-types */
import type { CanvasRenderingContext2D } from 'skia-canvas';
import type { FontRenderer } from '../font';
import type { IntrinsicElement } from './instrinsics';

export interface BaseThemeContext {
  renderer: FontRenderer;
}

export type StyleLocation = 'left' | 'center' | 'right';
export type StyleDirection = 'row' | 'column';

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
export type Measurement = number | Percent | Fraction | 'remaining';

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

export type Render<T = unknown, K extends BaseThemeContext = BaseThemeContext> = (
  ctx: CanvasRenderingContext2D,
  props: T,
  location: Location,
  theme: K
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
