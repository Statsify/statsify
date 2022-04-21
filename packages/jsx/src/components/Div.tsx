import { noop } from '@statsify/util';
import type * as JSX from '../jsx';

export interface DivProps {
  width?: number | JSX.Percentage;
  height?: number | JSX.Percentage;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
  align?: JSX.StyleAlign;
}

export const Div: JSX.RawFC<DivProps> = ({
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
  style: { location, direction, align },
  children,
});
