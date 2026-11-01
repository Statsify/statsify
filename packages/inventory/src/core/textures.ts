/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PackStack, assetPath } from "./pack.js";
import { context, decodePng } from "./canvas.js";

interface Animation {
  width?: number;
  height?: number;
  frametime?: number;
  interpolate?: boolean;
  frames?: (number | { index: number; time?: number })[];
}

/** The frame an animated texture shows at a game tick, and how far it has blended into the next */
interface Frame {
  index: number;
  next: number;
  blend: number;
  /** The ticks this frame starts at and the next one starts at */
  start: number;
  end: number;
}

// Frames are sized the way Minecraft sizes them: square unless the animation says otherwise
function frameSize(width: number, height: number, animation: Animation) {
  return {
    width: animation.width ?? (animation.height ? width : Math.min(width, height)),
    height: animation.height ?? (animation.width ? height : Math.min(width, height)),
  };
}

/** A frame's place in the texture */
function frameRect(width: number, height: number, animation: Animation | undefined, index: number) {
  if (!animation) return { x: 0, y: 0, width, height };

  const size = frameSize(width, height, animation);
  const columns = Math.floor(width / size.width);

  return {
    x: (index % columns) * size.width,
    y: Math.floor(index / columns) * size.height,
    ...size,
  };
}

/** Plays the animation forward to a tick, as SpriteContents.AnimatedTexture does */
function frameAt(width: number, height: number, animation: Animation, tick: number): Frame {
  const size = frameSize(width, height, animation);
  const count = Math.floor(width / size.width) * Math.floor(height / size.height);

  const frames = (animation.frames ?? Array.from({ length: count }, (_, index) => index)).map((frame) =>
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

  return { index: frames[0].index, next: frames[0].index, blend: 0, start: tick, end: tick };
}

// A PNG's size sits in its IHDR chunk, so animations can be timed before decoding
function pngSize(file: Uint8Array) {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** Sprites from a pack stack as pixels, decoded once each */
export class TextureLoader {
  private textures = new Map<string, Promise<ImageData>>();
  private animations = new Map<string, Animation | undefined>();

  public constructor(private stack: PackStack) {}

  /** The frame a texture shows at a game tick, or undefined when it doesn't animate */
  public frame(id: string, tick: number): Frame | undefined {
    const path = assetPath(id, "textures", ".png");

    if (!this.animations.has(path)) {
      this.animations.set(path, this.stack.json<{ animation?: Animation }>(`${path}.mcmeta`)?.animation);
    }

    const animation = this.animations.get(path);
    const file = this.stack.get(path);
    if (!animation || !file) return undefined;

    const { width, height } = pngSize(file);
    return frameAt(width, height, animation, tick);
  }

  /** A texture's pixels at a game tick, 20 to a second */
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
      const rect = frameRect(image.canvas.width, image.canvas.height, animation, index);
      return image.getImageData(rect.x, rect.y, rect.width, rect.height);
    };

    const pixels = read(frame?.index ?? 0);

    // Interpolated animations mix each frame into the next over its time
    if (frame?.blend) {
      const next = read(frame.next);
      for (let i = 0; i < pixels.data.length; i++) {
        pixels.data[i] = pixels.data[i] * (1 - frame.blend) + next.data[i] * frame.blend;
      }
    }

    return pixels;
  }
}
