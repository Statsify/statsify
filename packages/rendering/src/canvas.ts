/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas } from "skia-canvas";
import { startSentrySpan } from "@statsify/logger";

type CanvasOptions = ConstructorParameters<typeof Canvas>[2] & { gpu?: boolean };
type CanvasToBuffer = typeof Canvas.prototype.toBuffer;

let canvasToBufferInstrumented = false;

function instrumentCanvasToBuffer() {
  if (canvasToBufferInstrumented) return;
  canvasToBufferInstrumented = true;

  const toBuffer = Canvas.prototype.toBuffer;

  Canvas.prototype.toBuffer = function instrumentedToBuffer(
    this: Canvas,
    ...args: Parameters<CanvasToBuffer>
  ): ReturnType<CanvasToBuffer> {
    const format = args[0];
    const isPng = format === undefined || format === "png";

    if (!isPng) return toBuffer.apply(this, args) as ReturnType<CanvasToBuffer>;

    const span = startSentrySpan({
      op: "png.encode",
      description: "Encode canvas as PNG",
      data: {
        "render.width": this.width,
        "render.height": this.height,
      },
    });

    let result: ReturnType<CanvasToBuffer>;

    try {
      result = toBuffer.apply(this, args) as ReturnType<CanvasToBuffer>;
    } catch (error) {
      span?.finish();
      throw error;
    }

    if (!result || typeof (result as Promise<Buffer>).then !== "function") {
      span?.finish();
      return result;
    }

    return (result as Promise<Buffer>)
      .then((buffer) => {
        span?.setData("png.bytes", buffer.byteLength);
        return buffer;
      })
      .finally(() => span?.finish()) as ReturnType<CanvasToBuffer>;
  };
}

instrumentCanvasToBuffer();

export function createCanvas(
  width?: number,
  height?: number,
  options: CanvasOptions = {}
): Canvas {
  return new Canvas(width, height, { gpu: false, ...options });
}
