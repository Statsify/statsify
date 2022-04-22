import type { ImageData } from 'canvas';
import type * as JSX from '../jsx';

export interface BoxBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BoxRenderProps {
  border?: BoxBorderRadius;
  shadow?: number;
  color?: string;
}

export interface BoxProps extends BoxRenderProps {
  width?: number | JSX.Percentage;
  height?: number | JSX.Percentage;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
}

export const component: JSX.RawFC<BoxProps, BoxRenderProps> = ({
  children,
  width,
  height,
  margin = 4,
  padding,
  location = 'center',
  direction = 'row',
  border,
  color,
  shadow,
}) => ({
  name: 'Box',
  dimension: {
    padding,
    margin,
    width,
    height,
  },
  style: { location, direction, align: 'default' },
  props: { border, color, shadow },
  children,
});

type ImageDataLocation = [x: number, y: number, width: number, height: number];

const drawAndReplace = (
  ctx: CanvasRenderingContext2D,
  fn: (ctx: CanvasRenderingContext2D) => void,
  imageDataLoc: ImageDataLocation[]
) => {
  const backup = imageDataLoc.map(
    ([x, y, width, height]) =>
      [x, y, width > 0 && height > 0 ? ctx.getImageData(x, y, width, height) : null] as [
        number,
        number,
        ImageData | null
      ]
  );

  fn(ctx);

  backup.forEach(([x, y, imageData]) => imageData && ctx.putImageData(imageData, x, y));
};

const corners = (
  x: number,
  y: number,
  width: number,
  height: number,
  border: BoxBorderRadius
): ImageDataLocation[] => [
  [x, y, border.topLeft, border.topLeft],
  [x, y + height - border.bottomLeft, border.bottomLeft, border.bottomLeft],
  [x + width - border.topRight, y, border.topRight, border.topRight],
  [
    x + width - border.bottomRight,
    y + height - border.bottomRight,
    border.bottomRight,
    border.bottomRight,
  ],
];

export const render: JSX.Render<BoxRenderProps> = (
  ctx,
  {
    color = 'rgba(0, 0, 0, 0.5)',
    border = { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
    shadow = 4,
  },
  { x, y, width, height, padding }
) => {
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

  drawAndReplace(
    ctx,
    (ctx) => ctx.fillRect(x, y, width, height),
    corners(x, y, width, height, border)
  );

  if (!shadow) return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';

  drawAndReplace(
    ctx,
    (ctx) => {
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
    },
    corners(x + shadow, y + shadow, width, height, border)
  );
};
