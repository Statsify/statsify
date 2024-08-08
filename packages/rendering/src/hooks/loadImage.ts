/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios from "axios";
import { Image } from "skia-canvas";
import { readFile } from "node:fs/promises";

const bufferToImage = (buffer: Buffer): Image => {
  const image = new Image();
  // skia-canvas doesn't support Buffers in its typings
  image.src = buffer as unknown as string;

  Object.defineProperty(image, "_data", { value: buffer });

  return image;
};

export const loadImage = async (url: string | Buffer): Promise<Image> => {
  if (Buffer.isBuffer(url)) return bufferToImage(url);

  if (url.startsWith("http")) {
    const data = await axios
      .get(url, { responseType: "arraybuffer" })
      .then((res) => res.data);

    const buffer = Buffer.from(data);
    return bufferToImage(buffer);
  }

  const buffer = await readFile(url);
  return bufferToImage(buffer);
};
