/* eslint-disable @typescript-eslint/ban-types */
import type { CanvasRenderingContext2D } from 'canvas';

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

export type Percentage = `${number}%`;

export interface ElementDimension {
  padding?: Spacing;
  margin?: Spacing;
  width?: number | Percentage;
  height?: number | Percentage;
}

export interface Location {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: CompleteSpacing;
  margin: CompleteSpacing;
}

export type Render = (ctx: CanvasRenderingContext2D, location: Location) => void;

export interface ElementNodeBiDirectional {
  size?: number | Percentage;
  padding1: number;
  padding2: number;
  margin1: number;
  margin2: number;
  direction: StyleDirection;
}

export interface ElementNode {
  style: Style;
  render: Render;
  children?: ElementNode[];
  x: ElementNodeBiDirectional;
  y: ElementNodeBiDirectional;
}

export interface Element {
  name: string;
  style: Style;
  render: Render;
  children?: ElementNode[] | ElementNode;
  props?: Record<string, any>;
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

export type PropsWithChildren<T, K = ElementNode> = T & {
  children?: K | K[] | undefined;
};

export type FC<T = {}, K = ElementNode> = (props: PropsWithChildren<T, K>) => ElementNode;
export type RawFC<T = {}, K = ElementNode> = (props: PropsWithChildren<T, K>) => Element;
