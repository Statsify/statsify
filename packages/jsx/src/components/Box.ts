import type { CanvasRenderingContext2D, ImageData } from 'skia-canvas';
import { parseColor, RGBA } from '../colors';
import type * as JSX from '../jsx';

export interface BoxBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BoxRenderProps {
  border: BoxBorderRadius;
  shadowDistance: number;
  shadowOpacity: number;
  color: RGBA;
  outline: boolean;
  outlineSize: number;
  outlineColor: RGBA;
}

export interface BoxProps extends Omit<Partial<BoxRenderProps>, 'color' | 'outlineColor'> {
  width?: number | JSX.Percentage;
  height?: number | JSX.Percentage;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
  align?: JSX.StyleAlign;
  color?: string;
  outlineColor?: string;
}

export const component: JSX.RawFC<BoxProps, BoxRenderProps> = ({
  children,
  width,
  height,
  margin = 4,
  padding,
  location = 'center',
  direction = 'row',
  align = 'default',
  border = { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
  color = 'rgba(0, 0, 0, 0.5)',
  shadowDistance = 4,
  shadowOpacity = 0.42,
  outline = false,
  outlineSize = 4,
  outlineColor,
}) => {
  const rgbColor = parseColor(color);

  const outlineColorRgb: RGBA = outlineColor
    ? parseColor(outlineColor)
    : [rgbColor[0], rgbColor[1], rgbColor[2], 1];

  return {
    dimension: {
      padding,
      margin,
      width,
      height,
    },
    style: { location, direction, align },
    props: {
      border,
      color: rgbColor,
      shadowDistance,
      shadowOpacity,
      outline,
      outlineSize,
      outlineColor: outlineColorRgb,
    },
    children,
  };
};

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
  { color, border, shadowDistance, shadowOpacity, outline, outlineSize, outlineColor },
  { x, y, width, height, padding }
) => {
  ctx.fillStyle = `rgba(${color.join(', ')})`;

  outlineColor[3] = 1;
  ctx.strokeStyle = `rgba(${outlineColor.join(', ')})`;
  ctx.lineWidth = 4;

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
    (ctx) => {
      ctx.fillRect(x, y, width, height);

      if (!outline) return;

      ctx.strokeRect(
        x + outlineSize / 2,
        y + outlineSize / 2,
        width - outlineSize,
        height - outlineSize
      );
    },
    corners(x, y, width, height, border)
  );

  if (!shadowDistance) return;

  color[3] = shadowOpacity;
  ctx.fillStyle = `rgba(${color.join(', ')})`;

  drawAndReplace(
    ctx,
    (ctx) => {
      ctx.fillRect(x + shadowDistance, y + height, width, shadowDistance);
      ctx.fillRect(x + width, y + shadowDistance, shadowDistance, height - shadowDistance);

      if (border.bottomRight !== 0) {
        ctx.fillRect(
          x + width - border.bottomRight,
          y + height - border.bottomRight,
          border.bottomRight,
          border.bottomRight
        );
      }
    },
    corners(x + shadowDistance, y + shadowDistance, width, height, border)
  );
};
