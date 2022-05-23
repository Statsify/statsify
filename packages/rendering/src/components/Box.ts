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
  width?: JSX.Measurement;
  height?: JSX.Measurement;
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

export const render: JSX.Render<BoxRenderProps> = (
  ctx,
  { color, border, shadowDistance, shadowOpacity, outline, outlineSize, outlineColor },
  { x, y, width, height, padding }
) => {
  ctx.fillStyle = `rgba(${color.join(', ')})`;

  outlineColor[3] = 1;
  ctx.strokeStyle = `rgba(${outlineColor.join(', ')})`;
  ctx.lineWidth = outlineSize;

  width = width + padding.left + padding.right;
  height = height + padding.top + padding.bottom;

  /**
   * Prevent Anti Aliasing
   */
  x = Math.round(x);
  y = Math.round(y);
  width = Math.round(width);
  height = Math.round(height);

  ctx.beginPath();
  ctx.moveTo(x + border.topLeft, y);
  ctx.lineTo(x + width - border.topRight, y);
  ctx.lineTo(x + width - border.topRight, y + border.topRight);
  ctx.lineTo(x + width, y + border.topRight);
  ctx.lineTo(x + width, y + height - border.bottomRight);
  ctx.lineTo(x + width - border.bottomRight, y + height - border.bottomRight);
  ctx.lineTo(x + width - border.bottomRight, y + height);
  ctx.lineTo(x + border.bottomLeft, y + height);
  ctx.lineTo(x + border.bottomLeft, y + height - border.bottomLeft);
  ctx.lineTo(x, y + height - border.bottomLeft);
  ctx.lineTo(x, y + border.topLeft);
  ctx.lineTo(x + border.topLeft, y + border.topLeft);
  ctx.closePath();
  ctx.fill();

  if (outline) ctx.stroke();

  if (!shadowDistance) return;

  color[3] = shadowOpacity;
  ctx.fillStyle = `rgba(${color.join(', ')})`;

  ctx.beginPath();
  ctx.moveTo(x + width, y + shadowDistance + border.topRight);
  ctx.lineTo(x + width + shadowDistance, y + shadowDistance + border.topRight);
  ctx.lineTo(x + width + shadowDistance, y + height - border.bottomRight + shadowDistance);
  ctx.lineTo(x + width, y + height - border.bottomRight + shadowDistance);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + border.bottomLeft + shadowDistance, y + height);
  ctx.lineTo(x + border.bottomLeft + shadowDistance, y + height + shadowDistance);
  ctx.lineTo(
    x + width + shadowDistance - (border.bottomRight || shadowDistance),
    y + height + shadowDistance
  );
  ctx.lineTo(x + width + shadowDistance - (border.bottomRight || shadowDistance), y + height);
  ctx.closePath();
  ctx.fill();

  if (border.bottomRight !== 0)
    ctx.fillRect(
      x + width - border.bottomRight,
      y + height - border.bottomRight,
      border.bottomRight,
      border.bottomRight
    );
};
