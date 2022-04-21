import type { Image as CanvasImage } from 'canvas';
import type * as JSX from '../jsx';

export interface ImageProps {
  image: CanvasImage;
  width?: number | JSX.Percentage;
  height?: number | JSX.Percentage;
}

export const Image: JSX.RawFC<ImageProps> = ({
  image,
  height = image.height,
  width = image.width,
  children,
}) => ({
  name: 'Image',
  render: (ctx, { x, y, width, height }) => {
    ctx.drawImage(image, x, y, width, height);
  },
  dimension: {
    width,
    height,
  },
  style: { location: 'center', direction: 'row', align: 'center' },
  children,
});
