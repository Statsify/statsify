/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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
  width = image.width,
  height = image.height,
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

  ctx.drawImage(
    image,
    ...crop,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height)
  );
};
