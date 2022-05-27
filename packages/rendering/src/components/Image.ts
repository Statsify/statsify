import type { Canvas, Image as _Image } from 'skia-canvas';
import type * as JSX from '../jsx';

type CanvasImage = _Image | Canvas;

type ImageCropLocation = [sx: number, sy: number, sw: number, sh: number];
type ImageCrop = 'none' | 'resize' | ImageCropLocation;

export interface ImageRenderProps {
  image: CanvasImage;
  crop?: ImageCrop;
}

export interface ImageProps extends ImageRenderProps {
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
}

export const component: JSX.RawFC<ImageProps> = ({
  image,
  height = image.height,
  width = image.width,
  margin,
  crop,
  children,
}) => ({
  name: 'Image',
  dimension: {
    width,
    height,
    margin,
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
  if (!crop || crop === 'none') {
    crop = [0, 0, image.width, image.height];
  } else if (crop === 'resize') {
    const scale = image.width / width;
    crop = [0, 0, image.width, Math.round(height * scale)];
  }

  ctx.drawImage(image, ...crop, x, y, width, height);
};
