import type { Image as CanvasImage } from 'canvas';
import type * as JSX from '../jsx';

export interface ImageRenderProps {
  image: CanvasImage;
  crop?: [sx: number, sy: number, sw: number, sh: number];
}

export interface ImageProps extends ImageRenderProps {
  width?: number | JSX.Percentage;
  height?: number | JSX.Percentage;
}

export const component: JSX.RawFC<ImageProps> = ({
  image,
  height = image.height,
  width = image.width,
  crop,
  children,
}) => ({
  name: 'Image',
  dimension: {
    width,
    height,
  },
  style: { location: 'center', direction: 'row', align: 'center' },
  props: { image, crop },
  children,
});

export const render: JSX.Render<ImageRenderProps> = (
  ctx,
  { image, crop },
  { x, y, width, height }
) => {
  ctx.drawImage(image, ...(crop ?? []), x, y, width, height);
};
