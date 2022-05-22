import { noop } from '@statsify/util';
import type * as JSX from '../jsx';

export interface DivProps {
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
  align?: JSX.StyleAlign;
}

export type DivRenderProps = unknown;

export const component: JSX.RawFC<DivProps, DivRenderProps> = ({
  children,
  width,
  height,
  align = 'default',
  direction = 'row',
  location = 'center',
  margin,
  padding,
}) => ({
  name: 'Div',
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
