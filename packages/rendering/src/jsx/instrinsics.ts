import { Box, Div, Image, Text } from '../components';
import type { BaseThemeContext, PropsWithChildren, RawFC, Render } from './types';

export const intrinsicElements = {
  div: Div.component,
  box: Box.component,
  img: Image.component,
  text: Text.component,
};

export type IntrinsicElements = typeof intrinsicElements;

export type IntrinsicProps = {
  [key in IntrinsicElement]: IntrinsicElements[key] extends RawFC<infer P, any, infer C>
    ? PropsWithChildren<P, C>
    : never;
};

export type IntrinsicElement = keyof IntrinsicElements;

export type IntrinsicRenders<C extends BaseThemeContext = BaseThemeContext> = {
  [key in IntrinsicElement]: Render<
    IntrinsicElements[key] extends RawFC<any, infer U, any> ? U : never,
    C
  >;
};

export const intrinsicRenders: IntrinsicRenders = {
  div: Div.render,
  box: Box.render,
  img: Image.render,
  text: Text.render,
};
