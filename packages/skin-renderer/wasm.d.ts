/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// wasm-pack writes pkg/'s types only when it builds, after CI's typecheck, so the wasm build's public API is kept
// here. Keep it in step with src/wasm.rs.

export interface RenderOptions {
  /** Cape texture (PNG). */
  cape?: Uint8Array;
  /** Camera angle around the player in radians: 0 faces the front, π the back. Defaults to -0.3. */
  yaw?: number;
  pose?: "standing" | "punch" | "sneak" | "jump" | "swim" | "fly";
}

export class SkinMessenger {
  private constructor();
  static registerCanvas(canvasId: string): void;
  /**
   * Resolves once the skin is loaded onto the canvas, and rejects when it can't be drawn: a bad texture, or a browser
   * with neither WebGPU nor WebGL.
   */
  static renderSkin(canvasId: string, bytes: Uint8Array, slim: boolean, extruded: boolean, options?: RenderOptions): Promise<void>;
  /** Turns the camera to `yaw` radians around the player. */
  static setYaw(canvasId: string, yaw: number): void;
  static unregisterCanvas(canvasId: string): void;
}

export class SkinRenderer {
  /** Throws when the page already has an event loop, since winit allows one. */
  constructor();
  run(): void;
}

export default function init(options?: { module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module }): Promise<unknown>;
