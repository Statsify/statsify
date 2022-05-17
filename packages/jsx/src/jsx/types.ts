/* eslint-disable @typescript-eslint/ban-types */
import type { CanvasRenderingContext2D } from 'skia-canvas';
import type { FontRenderer } from '../font';
import type { IntrinsicElement } from './instrinsics';

export interface BaseThemeContext {
  renderer: FontRenderer;
}

export type StyleLocation = 'start' | 'end' | 'center';
export type StyleDirection = 'row' | 'column';
export type StyleAlign = 'default' | 'center';

export interface Style {
  location: StyleLocation;
  direction: StyleDirection;
  align: StyleAlign;
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
export type Measurement = number | Percent | Fraction;

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

export interface Element<T = unknown> {
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
  render: Render;
  children?: Instruction[];
}

export type PropsWithChildren<T, K = ElementNode> = T &
  (T extends { children: any }
    ? {}
    : {
        children?: K | K[] | undefined;
      });

export type FC<T = {}, K = ElementNode> = (props: PropsWithChildren<T, K>) => ElementNode;

/**
 * T is the type of the element's props
 * K is the type of the element's render function props
 * C is the type of the element's children
 */
export type RawFC<T = {}, K = T, C = ElementNode> = (props: PropsWithChildren<T, C>) => Element<K>;
