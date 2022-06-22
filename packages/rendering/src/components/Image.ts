/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type * as JSX from "../jsx";
import type { Canvas, Image as _Image } from "skia-canvas";

type CanvasImage = _Image | Canvas;

type ImageCropLocation = [sx: number, sy: number, sw: number, sh: number];
type ImageCrop = "none" | "resize" | "height-crop" | ImageCropLocation;

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
  name: "Image",
  dimension: {
    width,
    height,
    margin,
  },
  style: { location: "center", direction: "row", align: "center" },
  props: { image, crop },
  children,
});

export const render: JSX.Render<ImageRenderProps> = (
  ctx,
  { image, crop },
  { x, y, width, height }
) => {
  if (!crop || crop === "none") {
    crop = [0, 0, image.width, image.height];
  } else if (crop === "height-crop") {
    const scale = image.width / width;
    crop = [0, 0, image.width, Math.round(height * scale)];
  } else if (crop === "resize") {
    const newAspectRatio = width / height;

    let resizeWidth = image.width;
    let resizeHeight = image.height;

    if (resizeWidth > resizeHeight) {
      resizeWidth = Math.round(resizeHeight * newAspectRatio);
    } else {
      resizeHeight = Math.round(resizeWidth / newAspectRatio);
    }

    if (resizeWidth > image.width) {
      resizeWidth = image.width;
      resizeHeight = Math.round(resizeWidth / newAspectRatio);
    } else if (resizeHeight > image.height) {
      resizeHeight = image.height;
      resizeWidth = Math.round(resizeHeight * newAspectRatio);
    }

    crop = [0, 0, resizeWidth, resizeHeight];
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
