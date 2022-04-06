import type * as JSX from '../jsx';

export interface BoxBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BoxProps {
  width?: number | JSX.Percentage;
  height?: number | JSX.Percentage;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  color?: string;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
  border?: BoxBorderRadius;
}

export const Box: JSX.RawFC<BoxProps> = ({
  children,
  width,
  height,
  margin = 4,
  padding,
  color = 'rgba(0, 0, 0, 0.5)',
  location = 'center',
  direction = 'row',
  border = { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
}) => ({
  name: 'Box',
  render: (ctx, { x, y, width, height, padding }) => {
    ctx.fillStyle = color;

    width = width + padding.left + padding.right;
    height = height + padding.top + padding.bottom;

    /**
     * Prevent Anti Aliasing
     */
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    /**
     * Background
     */
    ctx.fillRect(x + 4, y, width - 8, height);

    //Left Side
    ctx.fillRect(x, y + border.topLeft, 4, height - (border.bottomLeft + border.topLeft));

    //Right Side
    ctx.fillRect(
      x + width - 4,
      y + border.topRight,
      4,
      height - (border.bottomRight + border.topRight)
    );

    /**
     * Shadow
     */

    ctx.fillStyle = `rgba(0, 0, 0, 0.30)`;

    ctx.fillRect(
      x + width,
      y + (border.topRight + 4),
      4,
      height - (border.topRight + border.bottomRight)
    );

    if (border.bottomRight !== 0)
      ctx.fillRect(x + width - border.bottomRight, y + height - border.bottomRight, 4, 4);

    ctx.fillRect(x + (border.bottomLeft + 4), y + height, width - (border.bottomRight + 4), 4);
  },
  dimension: {
    padding,
    margin,
    width,
    height,
  },
  style: { location, direction, align: 'default' },
  children,
});
