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
  shadow?: number;
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
  shadow = 4,
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

    const drawAndReplace = (
      fn: () => void,
      imageDataLoc: { x: number; y: number; width: number; height: number }[]
    ) => {
      const backup = imageDataLoc.map(({ x, y, width, height }) => ({
        x,
        y,
        imageData: width > 0 && height > 0 ? ctx.getImageData(x, y, width, height) : null,
      }));

      fn();

      backup.forEach(({ x, y, imageData }) => imageData && ctx.putImageData(imageData, x, y));
    };

    const corners = (x: number, y: number) => [
      {
        x,
        y,
        width: border.topLeft,
        height: border.topLeft,
      },
      {
        x,
        y: y + height - border.bottomLeft,
        width: border.bottomLeft,
        height: border.bottomLeft,
      },
      {
        x: x + width - border.topRight,
        y,
        width: border.topRight,
        height: border.topRight,
      },
      {
        x: x + width - border.bottomRight,
        y: y + height - border.bottomRight,
        width: border.bottomRight,
        height: border.bottomRight,
      },
    ];

    drawAndReplace(() => ctx.fillRect(x, y, width, height), corners(x, y));

    if (!shadow) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    drawAndReplace(() => {
      ctx.fillRect(x + shadow, y + height, width, shadow);
      ctx.fillRect(x + width, y + shadow, shadow, height - shadow);

      if (border.bottomRight !== 0) {
        ctx.fillRect(
          x + width - border.bottomRight,
          y + height - border.bottomRight,
          border.bottomRight,
          border.bottomRight
        );
      }
    }, corners(x + shadow, y + shadow));
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
