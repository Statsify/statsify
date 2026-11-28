/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PackStack, assetPath } from "./pack.js";
import { context, decodePng, pngSize } from "./canvas.js";

interface Animation {
  width?: number;
  height?: number;
  frametime?: number;
  interpolate?: boolean;
  frames?: (number | { index: number; time?: number })[];
}

interface Frame {
  index: number;
  next: number;
  blend: number;
  start: number;
  end: number;
}

// Frames are square unless the animation gives their size
function frameSize(width: number, height: number, animation: Animation) {
  return {
    width:
      animation.width ?? (animation.height ? width : Math.min(width, height)),
    height:
      animation.height ?? (animation.width ? height : Math.min(width, height)),
  };
}

function frameRect(
  width: number,
  height: number,
  animation: Animation | undefined,
  index: number,
) {
  if (!animation) return { x: 0, y: 0, width, height };

  const size = frameSize(width, height, animation);
  const columns = Math.floor(width / size.width);

  return {
    x: (index % columns) * size.width,
    y: Math.floor(index / columns) * size.height,
    ...size,
  };
}

function frameAt(
  width: number,
  height: number,
  animation: Animation,
  tick: number,
): Frame {
  const size = frameSize(width, height, animation);
  const count =
    Math.floor(width / size.width) * Math.floor(height / size.height);

  const frames = (
    animation.frames ?? Array.from({ length: count }, (_, index) => index)
  ).map((frame) =>
    typeof frame === "number"
      ? { index: frame, time: animation.frametime ?? 1 }
      : { index: frame.index, time: frame.time ?? animation.frametime ?? 1 },
  );

  const length = frames.reduce((total, frame) => total + frame.time, 0);
  let remaining = tick % length;

  for (const [position, frame] of frames.entries()) {
    if (remaining < frame.time) {
      return {
        index: frame.index,
        next: frames[(position + 1) % frames.length].index,
        blend: animation.interpolate ? remaining / frame.time : 0,
        start: tick - remaining,
        end: tick - remaining + frame.time,
      };
    }

    remaining -= frame.time;
  }

  return {
    index: frames[0].index,
    next: frames[0].index,
    blend: 0,
    start: tick,
    end: tick,
  };
}

export function mixPixels(pixels: ImageData, next: ImageData, amount: number) {
  for (let i = 0; i < pixels.data.length; i++) {
    pixels.data[i] = pixels.data[i] * (1 - amount) + next.data[i] * amount;
  }
}

export class TextureLoader {
  private textures = new Map<string, Promise<ImageData>>();
  private animations = new Map<string, Animation | undefined>();

  public constructor(private stack: PackStack) {}

  public frame(id: string, tick: number): Frame | undefined {
    const path = assetPath(id, "textures", ".png");

    if (!this.animations.has(path)) {
      this.animations.set(
        path,
        this.stack.json<{ animation?: Animation }>(`${path}.mcmeta`)?.animation,
      );
    }

    const animation = this.animations.get(path);
    const file = this.stack.get(path);
    if (!animation || !file) return undefined;

    const { width, height } = pngSize(file);
    return frameAt(width, height, animation, tick);
  }

  public get(id: string, tick = 0): Promise<ImageData> {
    const frame = this.frame(id, tick);

    // Blended frames change every tick, so keeping them would only grow the map
    if (frame?.blend) return this.load(id, frame);

    const key = frame ? `${id}@${frame.index}` : id;
    let texture = this.textures.get(key);

    if (!texture) {
      texture = this.load(id, frame);
      this.textures.set(key, texture);
    }

    return texture;
  }

  private async load(id: string, frame?: Frame) {
    const path = assetPath(id, "textures", ".png");
    const file = this.stack.get(path);
    if (!file) throw new Error(`The texture ${path} isn't in the pack`);

    const image = context(await decodePng(file));
    const animation = this.animations.get(path);

    const read = (index: number) => {
      const rect = frameRect(
        image.canvas.width,
        image.canvas.height,
        animation,
        index,
      );
      return image.getImageData(rect.x, rect.y, rect.width, rect.height);
    };

    const pixels = read(frame?.index ?? 0);
    if (frame?.blend) mixPixels(pixels, read(frame.next), frame.blend);

    return pixels;
  }
}
